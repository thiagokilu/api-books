import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
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

const TEST_EMAIL = "req_verif_e2e@email.com";
const TEST_USERNAME = "req_verif_user";
const PASSWORD = "password123";

describe("Request Verification Email (E2E)", () => {
    let unverifiedUserId: string;
    let unverifiedAccessToken: string;

    beforeAll(async () => {
        await app.ready();

        const usersRepository = new DrizzleUsersRepository();

        const existingUser = await usersRepository.findByEmail(TEST_EMAIL);
        if (existingUser) {
            await db.delete(verificationTokensTable).where(eq(verificationTokensTable.id, existingUser.id));
            await db.delete(usersTable).where(eq(usersTable.id, existingUser.id));
        }

        // 1. Cadastra usuário não verificado
        await app.inject({
            method: "POST",
            url: "/sign-up",
            payload: {
                name: "Unverified User",
                username: TEST_USERNAME,
                email: TEST_EMAIL,
                password: PASSWORD,
            },
        });

        const createdUser = await usersRepository.findByEmail(TEST_EMAIL);
        if (createdUser) {
            unverifiedUserId = createdUser.id;
        }

        // 2. Faz login para obter o access token
        const signInResponse = await app.inject({
            method: "POST",
            url: "/sign-in",
            payload: {
                email: TEST_EMAIL,
                password: PASSWORD,
            },
        });

        unverifiedAccessToken = signInResponse.json().accessToken;
    });

    beforeEach(async () => {
        vi.clearAllMocks();
        mockSend.mockResolvedValue({ error: null, data: { id: "email-id" } });

        const keys = await rateLimitRedis.keys("api-books:rate-limit:*");
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
                to: [TEST_EMAIL],
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
