import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { app } from "../src/server";
import { DrizzleUsersRepository } from "../src/app/repositories/drizzle/drizzle-users-repository";
import { rateLimitRedis } from "../src/infra/lib/rateLimit";

describe("sign-in", () => {
    beforeAll(async () => {
        await app.ready();

        const usersRepository = new DrizzleUsersRepository();

        // Create user (ignore error if already exists)
        await app.inject({
            method: "POST",
            url: "/sign-up",
            payload: {
                name: "Test User",
                username: "e2esigninuser",
                email: "e2esignin@email.com",
                password: "senha123",
            },
        });

        // Mark email as verified so sign-in works
        const user = await usersRepository.findByEmail("e2esignin@email.com");
        if (user) {
            await usersRepository.markEmailAsVerified(user.id);
        }
    });

    beforeEach(async () => {
        // Clear rate limit keys before each test to avoid 429
        const keys = await rateLimitRedis.keys("api-books:rate-limit:*");
        if (keys.length > 0) {
            await rateLimitRedis.del(...keys);
        }
    });

    afterAll(async () => {
        await app.close();
    });

    it("should authenticate a user successfully and return an access token", async () => {
        const signInResponse = await app.inject({
            method: "POST",
            url: "/sign-in",
            payload: {
                email: "e2esignin@email.com",
                password: "senha123",
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
                email: "e2esignin@email.com",
                password: "invalidPassword",
            },
        });

        const body = signInResponse.json();
        // InvalidCredentialsError returns 400 in signInController
        expect(signInResponse.statusCode).toBe(400);
        expect(body).toHaveProperty("error");
    });
});