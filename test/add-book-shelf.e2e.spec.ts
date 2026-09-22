import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { randomUUID } from "node:crypto";
import { app } from "../src/server";
import { DrizzleUsersRepository } from "../src/app/repositories/drizzle/drizzle-users-repository";
import { rateLimitRedis } from "../src/infra/lib/rateLimit";

describe("Add Book to Shelf (E2E)", () => {
  // dados únicos por execução do arquivo de teste
  const runId = randomUUID().slice(0, 8);
  const testEmail = `e2etest-${runId}@email.com`;
  const testUsername = `e2etestuser-${runId}`;
  const testPassword = "senha123";

  let accessToken: string;
  let userId: string;

  beforeAll(async () => {
    await app.ready();

    const usersRepository = new DrizzleUsersRepository();

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

    // falha rápido e com mensagem clara, em vez de deixar accessToken undefined
    if (signUpResponse.statusCode !== 201) {
      throw new Error(
        `Sign-up falhou no setup do teste: ${signUpResponse.statusCode} - ${signUpResponse.body}`,
      );
    }

    const user = await usersRepository.findByEmail(testEmail);
    if (!user) throw new Error("Usuário não encontrado após sign-up");
    userId = user.id;

    await usersRepository.markEmailAsVerified(user.id);

    // limpa rate-limit só das chaves relacionadas a este usuário/execução,
    // não o namespace inteiro
    const keys = await rateLimitRedis.keys(
      `api-books:rate-limit:*${testEmail}*`,
    );
    if (keys.length > 0) {
      await rateLimitRedis.del(...keys);
    }

    const signInResponse = await app.inject({
      method: "POST",
      url: "/sign-in",
      payload: { email: testEmail, password: testPassword },
    });

    if (signInResponse.statusCode !== 200) {
      throw new Error(
        `Sign-in falhou no setup do teste: ${signInResponse.statusCode} - ${signInResponse.body}`,
      );
    }

    accessToken = signInResponse.json().accessToken;
  });

  afterAll(async () => {
    // limpa o que este teste criou, precisamente por userId
    const usersRepository = new DrizzleUsersRepository();
    if (userId) {
      await usersRepository.deleteById(userId); // precisa existir/ter cascade nas shelf entries
    }
    await app.close();
  });

  it("should add a book to shelf and return 201", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/add-book-shelf",
      headers: { authorization: `Bearer ${accessToken}` },
      payload: {
        title: `Clean Code ${runId}`, // evita colisão de unicidade entre runs
        author_name: ["Robert C. Martin"],
        cover_i: 12345,
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual({
      message: "Book added to shelf successfully",
    });
  });

  it("should return 401 when not authenticated", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/add-book-shelf",
      payload: {
        title: "Clean Code",
        author_name: ["Robert C. Martin"],
        cover_i: 12345,
      },
    });

    expect(response.statusCode).toBe(401);
  });

  it("should return 400 when body is invalid", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/add-book-shelf",
      headers: { authorization: `Bearer ${accessToken}` },
      payload: { author_name: ["Robert C. Martin"] },
    });

    expect(response.statusCode).toBe(400);
  });
});
