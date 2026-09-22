import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { randomUUID } from "node:crypto";
import { app } from "../src/server";
import { DrizzleUsersRepository } from "../src/app/repositories/drizzle/drizzle-users-repository";
import { rateLimitRedis } from "../src/infra/lib/rateLimit";
import { db } from "../src/index";
import { usersTable } from "../src/infra/db/schema";
import { eq } from "drizzle-orm";

describe("Edit User Profile (E2E)", () => {
  // dados únicos por execução do arquivo de teste
  const runId = randomUUID().slice(0, 8);
  const testEmail = `e2e-edit-profile-${runId}@email.com`;
  const testUsername = `e2e-edit-profile-user-${runId}`;
  const testPassword = "senha123";

  let accessToken: string;
  let userId: string;

  beforeAll(async () => {
    await app.ready();

    const usersRepository = new DrizzleUsersRepository();

    // Garante estado limpo antes da suíte
    await db.delete(usersTable).where(eq(usersTable.email, testEmail));

    // Cria o usuário de teste
    const signUpResponse = await app.inject({
      method: "POST",
      url: "/sign-up",
      payload: {
        name: "Edit Profile User",
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

    // Marca e-mail como verificado para poder fazer login
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

    // Faz login e captura o accessToken
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

  it("should edit user profile (name) successfully and return 200", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/edit",
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      payload: {
        name: "Updated Name",
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toHaveProperty("message");
  });

  it("should edit user profile (bio) successfully and return 200", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/edit",
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      payload: {
        bio: "My new bio text",
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toHaveProperty("message");
  });

  it("should edit user profile (name and bio) simultaneously and return 200", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/edit",
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      payload: {
        name: "Full Updated Name",
        bio: "Updated bio alongside name",
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toHaveProperty("message");
  });

  it("should return 401 when not authenticated", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/edit",
      payload: {
        name: "Unauthenticated User",
      },
    });

    expect(response.statusCode).toBe(401);
  });

  it("should return 401 when using an invalid token", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/edit",
      headers: {
        authorization: "Bearer invalid.jwt.token",
      },
      payload: {
        name: "Should Fail",
      },
    });

    expect(response.statusCode).toBe(401);
  });
});