import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { randomUUID } from "node:crypto";
import { app } from "../src/server";
import { DrizzleUsersRepository } from "../src/app/repositories/drizzle/drizzle-users-repository";
import { rateLimitRedis } from "../src/infra/lib/rateLimit";
import { db } from "../src/index";
import { usersTable, booksTable } from "../src/infra/db/schema";
import { eq } from "drizzle-orm";

describe("Bookshelf Operations (E2E)", () => {
  // dados únicos por execução do arquivo de teste
  const runId = randomUUID().slice(0, 8);
  const testEmail = `e2e-shelf-ops-${runId}@email.com`;
  const testUsername = `e2e-shelf-ops-user-${runId}`;
  const testPassword = "senha123";
  const testCoverI = 987654 + parseInt(runId, 16) % 100000; // cover_i único baseado no runId

  let accessToken: string;
  let userId: string;

  beforeAll(async () => {
    await app.ready();

    const usersRepository = new DrizzleUsersRepository();

    await db.delete(usersTable).where(eq(usersTable.email, testEmail));
    await db.delete(booksTable).where(eq(booksTable.externalId, String(testCoverI)));

    const signUpResponse = await app.inject({
      method: "POST",
      url: "/sign-up",
      payload: {
        name: "Shelf User",
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

    // Add a book to shelf to prepare for operations
    await app.inject({
      method: "POST",
      url: "/add-book-shelf",
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      payload: {
        title: `Refactoring ${runId}`,
        author_name: ["Martin Fowler"],
        cover_i: testCoverI,
      },
    });
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
    await db.delete(booksTable).where(eq(booksTable.externalId, String(testCoverI)));
    await app.close();
  });

  it("should show user bookshelf with 200", async () => {
    const response = await app.inject({
      method: "GET",
      url: `/show-book-shelf/${userId}`,
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body).toHaveProperty("books");
    expect(Array.isArray(body.books)).toBe(true);
    expect(body.books.some((b: { cover_i: number }) => b.cover_i === testCoverI)).toBe(true);
  });

    it("should return 400 when user ID format is invalid on show bookshelf", async () => {
        const response = await app.inject({
            method: "GET",
            url: "/show-book-shelf/invalid-uuid",
        });

        expect(response.statusCode).toBe(400);
    });

  it("should edit book reading status with 200", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/edit-book-reading-status",
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      payload: {
        cover_i: testCoverI,
        readingStatus: "READING",
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      message: "Book reading status updated successfully",
    });
  });

  it("should edit book current reading page with 200", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/edit-book-reading-page",
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      payload: {
        cover_i: testCoverI,
        currentPage: 88,
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body).toHaveProperty("message", "Current page updated successfully");
    expect(body).toHaveProperty("currentPage", 88);
  });

  it("should remove book from bookshelf with 200", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/remove-book-shelf",
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      payload: {
        cover_i: testCoverI,
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      message: "Book removed from shelf successfully",
    });

    // Verify book is removed from bookshelf
    const checkResponse = await app.inject({
      method: "GET",
      url: `/show-book-shelf/${userId}`,
    });
    const checkBody = checkResponse.json();
    expect(checkBody.books.some((b: { cover_i: number }) => b.cover_i === testCoverI)).toBe(false);
  });
});
