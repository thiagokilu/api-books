import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { randomUUID } from "node:crypto";
import { app } from "../src/server";
import { rateLimitRedis } from "../src/infra/lib/rateLimit";
import { db } from "../src/index";
import { usersTable } from "../src/infra/db/schema";
import { eq } from "drizzle-orm";

describe("sign-up", () => {
  // dados únicos por execução do arquivo de teste
  const runId = randomUUID().slice(0, 8);
  const testEmail = `e2e-sign-up-${runId}@email.com`;
  const testUsername = `e2e-sign-up-user-${runId}`;
  const testPassword = "senha123";

  beforeAll(async () => {
    await app.ready();
  });

  beforeEach(async () => {
    // limpa rate-limit só das chaves relacionadas a este usuário/execução
    const keys = await rateLimitRedis.keys(
      `api-books:rate-limit:*${testEmail}*`,
    );
    if (keys.length > 0) {
      await rateLimitRedis.del(...keys);
    }

    // Delete test user so each test starts with a clean slate
    await db.delete(usersTable).where(eq(usersTable.email, testEmail));
  });

  afterAll(async () => {
    // Cleanup test user after the suite
    await db.delete(usersTable).where(eq(usersTable.email, testEmail));
    await app.close();
  });

  it("should create a new user successfully and return 201", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/sign-up",
      payload: {
        name: "Test User",
        username: testUsername,
        email: testEmail,
        password: testPassword,
      },
    });

    const body = response.json();
    expect(response.statusCode).toBe(201);
    expect(body).toHaveProperty("message");
  });

  it("should return 409 when user already exists", async () => {
    // Create the user first
    await app.inject({
      method: "POST",
      url: "/sign-up",
      payload: {
        name: "Test User",
        username: testUsername,
        email: testEmail,
        password: testPassword,
      },
    });

    // Try to create again — should get 409
    const response = await app.inject({
      method: "POST",
      url: "/sign-up",
      payload: {
        name: "Test User",
        username: testUsername,
        email: testEmail,
        password: testPassword,
      },
    });

    const body = response.json();
    expect(response.statusCode).toBe(409);
    expect(body).toHaveProperty("error");
  });

  it("should return 400 when body is invalid", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/sign-up",
      payload: {
        // missing required fields: name, username, password
        email: testEmail,
      },
    });

    expect(response.statusCode).toBe(400);
  });
});