import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { app } from "../src/server";
import { DrizzleUsersRepository } from "../src/app/repositories/drizzle/drizzle-users-repository";
import { rateLimitRedis } from "../src/infra/lib/rateLimit";
import { db } from "../src/index";
import { usersTable } from "../src/infra/db/schema";
import { eq } from "drizzle-orm";

const TEST_EMAIL = "e2e_profile@email.com";
const TEST_USERNAME = "e2e_profile_user";

describe("Get User Profile (E2E)", () => {
    let accessToken: string;

    beforeAll(async () => {
        await app.ready();

        const usersRepository = new DrizzleUsersRepository();

        await db.delete(usersTable).where(eq(usersTable.email, TEST_EMAIL));

        await app.inject({
            method: "POST",
            url: "/sign-up",
            payload: {
                name: "Profile User",
                username: TEST_USERNAME,
                email: TEST_EMAIL,
                password: "senha123",
            },
        });

        const user = await usersRepository.findByEmail(TEST_EMAIL);
        if (user) {
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
    });

    beforeEach(async () => {
        const keys = await rateLimitRedis.keys("api-books:rate-limit:*");
        if (keys.length > 0) {
            await rateLimitRedis.del(...keys);
        }
    });

    afterAll(async () => {
        await db.delete(usersTable).where(eq(usersTable.email, TEST_EMAIL));
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
            username: TEST_USERNAME,
            email: TEST_EMAIL,
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
