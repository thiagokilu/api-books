import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { app } from "../src/server";
import { rateLimitRedis } from "../src/infra/lib/rateLimit";
import { db } from "../src/index";
import { usersTable } from "../src/infra/db/schema";
import { eq } from "drizzle-orm";

const TEST_EMAIL = "e2esup@email.com";
const TEST_USERNAME = "e2esupuser";

describe("sign-up", () => {
    beforeAll(async () => {
        await app.ready();
    });

    beforeEach(async () => {
        // Clear rate limit keys before each test to avoid 429
        const keys = await rateLimitRedis.keys("api-books:rate-limit:*");
        if (keys.length > 0) {
            await rateLimitRedis.del(...keys);
        }

        // Delete test user so each test starts with a clean slate
        await db.delete(usersTable).where(eq(usersTable.email, TEST_EMAIL));
    });

    afterAll(async () => {
        // Cleanup test user after the suite
        await db.delete(usersTable).where(eq(usersTable.email, TEST_EMAIL));
        await app.close();
    });

    it("should create a new user successfully and return 201", async () => {
        const response = await app.inject({
            method: "POST",
            url: "/sign-up",
            payload: {
                name: "Test User",
                username: TEST_USERNAME,
                email: TEST_EMAIL,
                password: "senha123",
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
                username: TEST_USERNAME,
                email: TEST_EMAIL,
                password: "senha123",
            },
        });

        // Try to create again — should get 409
        const response = await app.inject({
            method: "POST",
            url: "/sign-up",
            payload: {
                name: "Test User",
                username: TEST_USERNAME,
                email: TEST_EMAIL,
                password: "senha123",
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
                email: TEST_EMAIL,
            },
        });

        expect(response.statusCode).toBe(400);
    });
});