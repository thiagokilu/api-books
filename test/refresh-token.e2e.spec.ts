import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { randomUUID } from "node:crypto";
import { app } from "../src/server";
import { DrizzleUsersRepository } from "../src/app/repositories/drizzle/drizzle-users-repository";
import { rateLimitRedis } from "../src/infra/lib/rateLimit";
import { db } from "../src/index";
import { usersTable } from "../src/infra/db/schema";
import { eq } from "drizzle-orm";

describe("Refresh Token (E2E)", () => {
  // dados únicos por execução do arquivo de teste
  const runId = randomUUID().slice(0, 8);
  const testEmail = `e2e-refresh-${runId}@email.com`;
  const testUsername = `e2e-refresh-user-${runId}`;
  const testPassword = "senha123";

  let refreshToken: string;
  let userId: string;

  beforeAll(async () => {
    await app.ready();

    const usersRepository = new DrizzleUsersRepository();

    await db.delete(usersTable).where(eq(usersTable.email, testEmail));

    const signUpResponse = await app.inject({
      method: "POST",
      url: "/sign-up",
      payload: {
        name: "Refresh User",
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

    const user = await usersRepository.findByEmail(testEmail);
    if (!user) throw new Error("Usuário não encontrado após sign-up");
    userId = user.id;

    await usersRepository.markEmailAsVerified(user.id);

    // limpa rate-limit só das chaves relacionadas a este usuário/execução
    const keys = await rateLimitRedis.keys(
      `api-books:rate-limit:*${testEmail}*`,
    );
    if (keys.length > 0) {
      await rateLimitRedis.del(...keys);
    }

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

    const cookie = signInResponse.cookies.find((c) => c.name === "refreshToken");
    refreshToken = cookie?.value ?? "";
  });

  beforeEach(async () => {
    // limpa rate-limit só das chaves relacionadas a este usuário/execução
    const keys = await rateLimitRedis.keys(
      `api-books:rate-limit:*${testEmail}*`,
    );
    if (keys.length > 0) {
      await rateLimitRedis.del(...keys);
    }
  });

  afterAll(async () => {
    // limpa o que este teste criou, precisamente por userId
    const usersRepository = new DrizzleUsersRepository();
    if (userId) {
      await usersRepository.deleteById(userId);
    }
    await app.close();
  });

    it("should generate a new access token using a valid refresh token cookie", async () => {
        const response = await app.inject({
            method: "POST",
            url: "/refresh-token",
            cookies: {
                refreshToken,
            },
        });

        expect(response.statusCode).toBe(200);
        const body = response.json();
        expect(body).toHaveProperty("accessToken");

        const newCookie = response.cookies.find((c) => c.name === "refreshToken");
        expect(newCookie).toBeDefined();
    });

    it("should return 401 when refresh token cookie is missing", async () => {
        const response = await app.inject({
            method: "POST",
            url: "/refresh-token",
        });

        expect(response.statusCode).toBe(401);
    });
});
