import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { randomUUID } from "node:crypto";
import { app } from "../src/server";
import { DrizzleUsersRepository } from "../src/app/repositories/drizzle/drizzle-users-repository";
import { rateLimitRedis } from "../src/infra/lib/rateLimit";

describe("sign-in", () => {
  // dados únicos por execução do arquivo de teste
  const runId = randomUUID().slice(0, 8);
  const testEmail = `e2e-sign-in-${runId}@email.com`;
  const testUsername = `e2e-sign-in-user-${runId}`;
  const testPassword = "senha123";

  let userId: string;

  beforeAll(async () => {
    await app.ready();

    const usersRepository = new DrizzleUsersRepository();

    // Create user (ignore error if already exists)
    const signUpResponse = await app.inject({
      method: "POST",
      url: "/sign-up",
      payload: {
        name: "Test User",
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

    // Mark email as verified so sign-in works
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

  it("should authenticate a user successfully and return an access token", async () => {
    const signInResponse = await app.inject({
      method: "POST",
      url: "/sign-in",
      payload: {
        email: testEmail,
        password: testPassword,
      },
    });

    const body = signInResponse.json();
    expect(signInResponse.statusCode).toBe(200);
    expect(body).toHaveProperty("accessToken");
  });

  it("should not authenticate a user with invalid password", async () => {
    const signInResponse = await app.inject({
      method: "POST",
      url: "/sign-in",
      payload: {
        email: testEmail,
        password: "invalidPassword",
      },
    });

    const body = signInResponse.json();
    // InvalidCredentialsError returns 400 in signInController
    expect(signInResponse.statusCode).toBe(400);
    expect(body).toHaveProperty("error");
  });
});