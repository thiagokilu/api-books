import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { app } from "../src/server";
import { DrizzleUsersRepository } from "../src/app/repositories/drizzle/drizzle-users-repository";
import { rateLimitRedis } from "../src/infra/lib/rateLimit";
import { db } from "../src/index";
import { usersTable } from "../src/infra/db/schema";
import { eq } from "drizzle-orm";

const TEST_EMAIL = "e2e_refresh@email.com";
const TEST_USERNAME = "e2e_refresh_user";

describe("Refresh Token (E2E)", () => {
    let refreshToken: string;

    beforeAll(async () => {
        await app.ready();

        const usersRepository = new DrizzleUsersRepository();

        await db.delete(usersTable).where(eq(usersTable.email, TEST_EMAIL));

        await app.inject({
            method: "POST",
            url: "/sign-up",
            payload: {
                name: "Refresh User",
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

        const cookie = signInResponse.cookies.find((c) => c.name === "refreshToken");
        refreshToken = cookie?.value ?? "";
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

    it("should generate a new access token using a valid refresh token cookie", async () => {
        const response = await app.inject({
            method: "POST",
            url: "/refresh-token",
            cookies: {
                refreshToken,
            },
        });

        expect(response.statusCode).toBe(200);
        const body = response.json();
        expect(body).toHaveProperty("accessToken");

        const newCookie = response.cookies.find((c) => c.name === "refreshToken");
        expect(newCookie).toBeDefined();
    });

    it("should return 401 when refresh token cookie is missing", async () => {
        const response = await app.inject({
            method: "POST",
            url: "/refresh-token",
        });

        expect(response.statusCode).toBe(401);
    });
});
