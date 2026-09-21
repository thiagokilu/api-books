import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { app } from "../src/server";
import { DrizzleUsersRepository } from "../src/app/repositories/drizzle/drizzle-users-repository";
import { rateLimitRedis } from "../src/infra/lib/rateLimit";
import { db } from "../src/index";
import { usersTable } from "../src/infra/db/schema";
import { eq } from "drizzle-orm";

const TEST_EMAIL = "e2e_edit_profile@email.com";
const TEST_USERNAME = "e2e_edit_profile_user";

describe("Edit User Profile (E2E)", () => {
    let accessToken: string;

    beforeAll(async () => {
        await app.ready();

        const usersRepository = new DrizzleUsersRepository();

        // Garante estado limpo antes da suíte
        await db.delete(usersTable).where(eq(usersTable.email, TEST_EMAIL));

        // Cria o usuário de teste
        await app.inject({
            method: "POST",
            url: "/sign-up",
            payload: {
                name: "Edit Profile User",
                username: TEST_USERNAME,
                email: TEST_EMAIL,
                password: "senha123",
            },
        });

        // Marca e-mail como verificado para poder fazer login
        const user = await usersRepository.findByEmail(TEST_EMAIL);
        if (user) {
            await usersRepository.markEmailAsVerified(user.id);
        }

        // Faz login e captura o accessToken
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
        // Limpa rate limit antes de cada teste para evitar 429
        const keys = await rateLimitRedis.keys("api-books:rate-limit:*");
        if (keys.length > 0) {
            await rateLimitRedis.del(...keys);
        }
    });

    afterAll(async () => {
        // Limpeza final
        await db.delete(usersTable).where(eq(usersTable.email, TEST_EMAIL));
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