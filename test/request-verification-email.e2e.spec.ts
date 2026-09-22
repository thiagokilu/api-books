import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { app } from "../src/server";
import { rateLimitRedis } from "../src/infra/lib/rateLimit";
import { db } from "../src/index";
import { usersTable, verificationTokensTable } from "../src/infra/db/schema";
import { eq } from "drizzle-orm";
import { DrizzleUsersRepository } from "../src/app/repositories/drizzle/drizzle-users-repository";

const mockSend = vi.fn();

vi.mock("resend", () => {
    return {
        Resend: class {
            emails = {
                send: mockSend,
            };
        },
    };
});

describe("Request Verification Email (E2E)", () => {
  // dados únicos por execução do arquivo de teste
  const runId = randomUUID().slice(0, 8);
  const testEmail = `e2e-req-verif-${runId}@email.com`;
  const testUsername = `e2e-req-verif-user-${runId}`;
  const testPassword = "password123";

  let unverifiedUserId: string;
  let unverifiedAccessToken: string;

  beforeAll(async () => {
    await app.ready();

    const usersRepository = new DrizzleUsersRepository();

    const existingUser = await usersRepository.findByEmail(testEmail);
    if (existingUser) {
      await db.delete(verificationTokensTable).where(eq(verificationTokensTable.id, existingUser.id));
      await db.delete(usersTable).where(eq(usersTable.id, existingUser.id));
    }

    // 1. Cadastra usuário não verificado
    const signUpResponse = await app.inject({
      method: "POST",
      url: "/sign-up",
      payload: {
        name: "Unverified User",
        username: testUsername,
        email: testEmail,
        password: testPassword,
      },
    });

    if (signUpResponse.statusCode !== 201) {
      throw new Error(
        `Sign-up falhou no setup do teste: ${signUpResponse.statusCode} - ${signUpResponse.body}`,
      );
    }

    const createdUser = await usersRepository.findByEmail(testEmail);
    if (!createdUser) {
      throw new Error("Usuário não encontrado após sign-up");
    }
    unverifiedUserId = createdUser.id;

    // limpa rate-limit só das chaves relacionadas a este usuário/execução
    const keys = await rateLimitRedis.keys(
      `api-books:rate-limit:*${testEmail}*`,
    );
    if (keys.length > 0) {
      await rateLimitRedis.del(...keys);
    }

    // 2. Faz login para obter o access token
    const signInResponse = await app.inject({
      method: "POST",
      url: "/sign-in",
      payload: {
        email: testEmail,
        password: testPassword,
      },
    });

    if (signInResponse.statusCode !== 200) {
      throw new Error(
        `Sign-in falhou no setup do teste: ${signInResponse.statusCode} - ${signInResponse.body}`,
      );
    }

    unverifiedAccessToken = signInResponse.json().accessToken;
  });

  beforeEach(async () => {
    vi.clearAllMocks();
    mockSend.mockResolvedValue({ error: null, data: { id: "email-id" } });

    // limpa rate-limit só das chaves relacionadas a este usuário/execução
    const keys = await rateLimitRedis.keys(
      `api-books:rate-limit:*${testEmail}*`,
    );
    if (keys.length > 0) {
      await rateLimitRedis.del(...keys);
    }

    await db.delete(verificationTokensTable).where(eq(verificationTokensTable.id, unverifiedUserId));
  });

    afterAll(async () => {
        await db.delete(verificationTokensTable).where(eq(verificationTokensTable.id, unverifiedUserId));
        await db.delete(usersTable).where(eq(usersTable.id, unverifiedUserId));
        await app.close();
    });

    it("should allow an authenticated unverified user to request email verification and return 200", async () => {
        const response = await app.inject({
            method: "POST",
            url: "/request-verification-email",
            headers: {
                authorization: `Bearer ${unverifiedAccessToken}`,
            },
        });

        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual({
            message: "If an account exists for this email, you will receive verification instructions.",
        });

        // Verifica que o token de verificação foi gerado e salvo no banco
        const tokens = await db
            .select()
            .from(verificationTokensTable)
            .where(eq(verificationTokensTable.id, unverifiedUserId));

        expect(tokens).toHaveLength(1);
        expect(tokens[0].token).toBeDefined();
        expect(new Date(tokens[0].expiresAt).getTime()).toBeGreaterThan(Date.now());

        // Verifica se o e-mail de verificação foi enviado
        expect(mockSend).toHaveBeenCalledWith(
            expect.objectContaining({
                to: [testEmail],
                subject: "Verify your email",
            }),
        );
    });

    it("should return 200 generic message without sending email if user is already verified", async () => {
        const usersRepository = new DrizzleUsersRepository();
        await usersRepository.markEmailAsVerified(unverifiedUserId);

        const response = await app.inject({
            method: "POST",
            url: "/request-verification-email",
            headers: {
                authorization: `Bearer ${unverifiedAccessToken}`,
            },
        });

        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual({
            message: "If an account exists for this email, you will receive verification instructions.",
        });

        // Nenhum e-mail deve ter sido enviado
        expect(mockSend).not.toHaveBeenCalled();

        // Reverte para false para os próximos testes
        await db.update(usersTable).set({ emailVerified: false }).where(eq(usersTable.id, unverifiedUserId));
    });

    it("should return 401 when not authenticated", async () => {
        const response = await app.inject({
            method: "POST",
            url: "/request-verification-email",
        });

        expect(response.statusCode).toBe(401);
    });

    it("should return 401 when token is invalid", async () => {
        const response = await app.inject({
            method: "POST",
            url: "/request-verification-email",
            headers: {
                authorization: "Bearer invalid-jwt-token",
            },
        });

        expect(response.statusCode).toBe(401);
    });
});
