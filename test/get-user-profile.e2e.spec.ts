import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { randomUUID } from "node:crypto";
import { app } from "../src/server";
import { DrizzleUsersRepository } from "../src/app/repositories/drizzle/drizzle-users-repository";
import { rateLimitRedis } from "../src/infra/lib/rateLimit";
import { db } from "../src/index";
import { usersTable } from "../src/infra/db/schema";
import { eq } from "drizzle-orm";

describe("Get User Profile (E2E)", () => {
  // dados únicos por execução do arquivo de teste
  const runId = randomUUID().slice(0, 8);
  const testEmail = `e2e-profile-${runId}@email.com`;
  const testUsername = `e2e-profile-user-${runId}`;
  const testPassword = "senha123";

  let accessToken: string;
  let userId: string;

  beforeAll(async () => {
    await app.ready();

    const usersRepository = new DrizzleUsersRepository();

    await db.delete(usersTable).where(eq(usersTable.email, testEmail));

    const signUpResponse = await app.inject({
      method: "POST",
      url: "/sign-up",
      payload: {
        name: "Profile User",
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

    accessToken = signInResponse.json().accessToken;
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

  it("should retrieve user profile successfully and return 200", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/me",
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body).toHaveProperty("message", "User profile retrieved");
    expect(body.user).toEqual({
      username: testUsername,
      email: testEmail,
    });
  });

  it("should return 401 when not authenticated", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/me",
    });

    expect(response.statusCode).toBe(401);
  });
});
