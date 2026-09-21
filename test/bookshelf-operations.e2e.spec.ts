import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { app } from "../src/server";
import { DrizzleUsersRepository } from "../src/app/repositories/drizzle/drizzle-users-repository";
import { rateLimitRedis } from "../src/infra/lib/rateLimit";
import { db } from "../src/index";
import { usersTable, booksTable } from "../src/infra/db/schema";
import { eq } from "drizzle-orm";

const TEST_EMAIL = "e2e_shelf_ops@email.com";
const TEST_USERNAME = "e2e_shelf_ops_user";
const TEST_COVER_I = 987654;

describe("Bookshelf Operations (E2E)", () => {
    let accessToken: string;
    let userId: string;

    beforeAll(async () => {
        await app.ready();

        const usersRepository = new DrizzleUsersRepository();

        await db.delete(usersTable).where(eq(usersTable.email, TEST_EMAIL));
        await db.delete(booksTable).where(eq(booksTable.externalId, String(TEST_COVER_I)));

        await app.inject({
            method: "POST",
            url: "/sign-up",
            payload: {
                name: "Shelf User",
                username: TEST_USERNAME,
                email: TEST_EMAIL,
                password: "senha123",
            },
        });

        const user = await usersRepository.findByEmail(TEST_EMAIL);
        if (user) {
            userId = user.id;
            await usersRepository.markEmailAsVerified(user.id);
        }

        const signInResponse = await app.inject({
            method: "POST",
            url: "/sign-in",
            payload: {
                email: TEST_EMAIL,
                password: "senha123",
            },
        });

        const body = signInResponse.json();
        accessToken = body.accessToken;

        // Add a book to shelf to prepare for operations
        await app.inject({
            method: "POST",
            url: "/add-book-shelf",
            headers: {
                authorization: `Bearer ${accessToken}`,
            },
            payload: {
                title: "Refactoring",
                author_name: ["Martin Fowler"],
                cover_i: TEST_COVER_I,
            },
        });
    });

    beforeEach(async () => {
        const keys = await rateLimitRedis.keys("api-books:rate-limit:*");
        if (keys.length > 0) {
            await rateLimitRedis.del(...keys);
        }
    });

    afterAll(async () => {
        await db.delete(usersTable).where(eq(usersTable.email, TEST_EMAIL));
        await db.delete(booksTable).where(eq(booksTable.externalId, String(TEST_COVER_I)));
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
        expect(body.books.some((b: { cover_i: number }) => b.cover_i === TEST_COVER_I)).toBe(true);
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
                cover_i: TEST_COVER_I,
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
                cover_i: TEST_COVER_I,
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
                cover_i: TEST_COVER_I,
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
        expect(checkBody.books.some((b: { cover_i: number }) => b.cover_i === TEST_COVER_I)).toBe(false);
    });
});
