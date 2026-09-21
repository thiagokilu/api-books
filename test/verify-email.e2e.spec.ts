import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { app } from "../src/server";
import { rateLimitRedis } from "../src/infra/lib/rateLimit";
import { db } from "../src/index";
import { usersTable, verificationTokensTable } from "../src/infra/db/schema";
import { eq } from "drizzle-orm";
import { DrizzleUsersRepository } from "../src/app/repositories/drizzle/drizzle-users-repository";
import { randomBytes } from "crypto";

const TEST_EMAIL = "verify_email_e2e@email.com";
const TEST_USERNAME = "verify_email_user";
const PASSWORD = "password123";

describe("Verify Email (E2E)", () => {
    let userId: string;
    let accessToken: string;

    beforeAll(async () => {
        await app.ready();

        const usersRepository = new DrizzleUsersRepository();

        const existingUser = await usersRepository.findByEmail(TEST_EMAIL);
        if (existingUser) {
            await db.delete(verificationTokensTable).where(eq(verificationTokensTable.id, existingUser.id));
            await db.delete(usersTable).where(eq(usersTable.id, existingUser.id));
        }

        // 1. Cadastra usuário (emailVerified inicia como false)
        await app.inject({
            method: "POST",
            url: "/sign-up",
            payload: {
                name: "Verify Email User",
                username: TEST_USERNAME,
                email: TEST_EMAIL,
                password: PASSWORD,
            },
        });

        const createdUser = await usersRepository.findByEmail(TEST_EMAIL);
        if (createdUser) {
            userId = createdUser.id;
        }

        // 2. Faz login para obter o access token
        const signInResponse = await app.inject({
            method: "POST",
            url: "/sign-in",
            payload: {
                email: TEST_EMAIL,
                password: PASSWORD,
            },
        });

        accessToken = signInResponse.json().accessToken;
    });

    beforeEach(async () => {
        const keys = await rateLimitRedis.keys("api-books:rate-limit:*");
        if (keys.length > 0) {
            await rateLimitRedis.del(...keys);
        }

        await db.delete(verificationTokensTable).where(eq(verificationTokensTable.id, userId));
        await db.update(usersTable).set({ emailVerified: false }).where(eq(usersTable.id, userId));
    });

    afterAll(async () => {
        await db.delete(verificationTokensTable).where(eq(verificationTokensTable.id, userId));
        await db.delete(usersTable).where(eq(usersTable.id, userId));
        await app.close();
    });

    it("should verify email with valid token, delete token and unlock protected routes", async () => {
        // Antes da verificação: rota protegida retorna 401 "E-mail não verificado"
        const beforeProfileResponse = await app.inject({
            method: "GET",
            url: "/me",
            headers: {
                authorization: `Bearer ${accessToken}`,
            },
        });
        expect(beforeProfileResponse.statusCode).toBe(401);

        // Cria o token de verificação no banco
        const token = randomBytes(32).toString("hex");
        await db.insert(verificationTokensTable).values({
            id: userId,
            token,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1h
        });

        // Executa a confirmação de e-mail
        const response = await app.inject({
            method: "POST",
            url: "/verify-email",
            payload: {
                token,
            },
        });

        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual({
            message: "Email verified successfully.",
        });

        // Verifica que o usuário agora está com email_verified = true no banco
        const [updatedUser] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
        expect(updatedUser.emailVerified).toBe(true);

        // Verifica que o token foi deletado do banco
        const tokensInDb = await db.select().from(verificationTokensTable).where(eq(verificationTokensTable.id, userId));
        expect(tokensInDb).toHaveLength(0);

        // Agora a rota protegida deve retornar 200 com sucesso!
        const afterProfileResponse = await app.inject({
            method: "GET",
            url: "/me",
            headers: {
                authorization: `Bearer ${accessToken}`,
            },
        });
        expect(afterProfileResponse.statusCode).toBe(200);
    });

    it("should return 400 when attempting to reuse a token", async () => {
        const token = randomBytes(32).toString("hex");
        await db.insert(verificationTokensTable).values({
            id: userId,
            token,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        });

        // Primeiro uso
        await app.inject({
            method: "POST",
            url: "/verify-email",
            payload: { token },
        });

        // Limpa rate limit
        const keys = await rateLimitRedis.keys("api-books:rate-limit:*");
        if (keys.length > 0) {
            await rateLimitRedis.del(...keys);
        }

        // Segundo uso - deve falhar
        const response = await app.inject({
            method: "POST",
            url: "/verify-email",
            payload: { token },
        });

        expect(response.statusCode).toBe(400);
        expect(response.json()).toEqual({
            message: "Invalid or expired token",
        });
    });

    it("should return 400 with non-existent token", async () => {
        const response = await app.inject({
            method: "POST",
            url: "/verify-email",
            payload: {
                token: "non-existent-token",
            },
        });

        expect(response.statusCode).toBe(400);
        expect(response.json()).toEqual({
            message: "Invalid or expired token",
        });
    });

    it("should return 400 when token is expired", async () => {
        const token = randomBytes(32).toString("hex");
        await db.insert(verificationTokensTable).values({
            id: userId,
            token,
            expiresAt: new Date(Date.now() - 1000 * 60), // expirado há 1 minuto
        });

        const response = await app.inject({
            method: "POST",
            url: "/verify-email",
            payload: { token },
        });

        expect(response.statusCode).toBe(400);
        expect(response.json()).toEqual({
            message: "Invalid or expired token",
        });
    });

    it("should return 400 when body is invalid", async () => {
        const response = await app.inject({
            method: "POST",
            url: "/verify-email",
            payload: {},
        });

        expect(response.statusCode).toBe(400);
    });
});
