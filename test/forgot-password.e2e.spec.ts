import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { app } from "../src/server";
import { rateLimitRedis } from "../src/infra/lib/rateLimit";
import { db } from "../src/index";
import { usersTable, passwordResetTokensTable } from "../src/infra/db/schema";
import { eq } from "drizzle-orm";
import { DrizzleUsersRepository } from "../src/app/repositories/drizzle/drizzle-users-repository";
import { createHash, randomBytes } from "crypto";
import bcrypt from "bcrypt";

const TEST_EMAIL = "forgot_pwd_e2e@email.com";
const TEST_USERNAME = "forgot_pwd_user";
const INITIAL_PASSWORD = "initialPassword123";

describe("Forgot Password (E2E)", () => {
    let userId: string;

    beforeAll(async () => {
        await app.ready();

        const usersRepository = new DrizzleUsersRepository();

        const existingUser = await usersRepository.findByEmail(TEST_EMAIL);
        if (existingUser) {
            await db.delete(passwordResetTokensTable).where(eq(passwordResetTokensTable.userId, existingUser.id));
            await db.delete(usersTable).where(eq(usersTable.id, existingUser.id));
        }

        const hashedPassword = await bcrypt.hash(INITIAL_PASSWORD, 10);

        const user = await usersRepository.create({
            name: "Forgot Pwd User",
            username: TEST_USERNAME,
            email: TEST_EMAIL,
            password: hashedPassword,
        });

        userId = user.id;
        await usersRepository.markEmailAsVerified(user.id);
    });

    beforeEach(async () => {
        const keys = await rateLimitRedis.keys("api-books:rate-limit:*");
        if (keys.length > 0) {
            await rateLimitRedis.del(...keys);
        }

        await db.delete(passwordResetTokensTable).where(eq(passwordResetTokensTable.userId, userId));
    });

    afterAll(async () => {
        await db.delete(passwordResetTokensTable).where(eq(passwordResetTokensTable.userId, userId));
        await db.delete(usersTable).where(eq(usersTable.id, userId));
        await app.close();
    });

    it("should reset password with valid token and allow login with new password", async () => {
        const rawToken = randomBytes(32).toString("hex");
        const tokenHash = createHash("sha256").update(rawToken).digest("hex");

        await db.insert(passwordResetTokensTable).values({
            userId,
            token: tokenHash,
            expiresAt: new Date(Date.now() + 1000 * 60 * 30), // 30 min
        });

        const newPassword = "newPassword456";

        const response = await app.inject({
            method: "POST",
            url: "/forgot-password",
            payload: {
                token: rawToken,
                newPassword,
            },
        });

        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual({
            message: "Password updated successfully",
        });

        // Verifica se o token foi consumido (deletado do banco)
        const tokensInDb = await db
            .select()
            .from(passwordResetTokensTable)
            .where(eq(passwordResetTokensTable.token, tokenHash));
        expect(tokensInDb).toHaveLength(0);

        // Verifica que o login com a senha antiga falha
        const oldLoginResponse = await app.inject({
            method: "POST",
            url: "/sign-in",
            payload: {
                email: TEST_EMAIL,
                password: INITIAL_PASSWORD,
            },
        });
        expect(oldLoginResponse.statusCode).toBe(400);

        // Verifica que o login com a nova senha funciona
        const newLoginResponse = await app.inject({
            method: "POST",
            url: "/sign-in",
            payload: {
                email: TEST_EMAIL,
                password: newPassword,
            },
        });
        expect(newLoginResponse.statusCode).toBe(200);
        expect(newLoginResponse.json()).toHaveProperty("accessToken");
    });

    it("should return 400 when attempting to reuse a consumed token", async () => {
        const rawToken = randomBytes(32).toString("hex");
        const tokenHash = createHash("sha256").update(rawToken).digest("hex");

        await db.insert(passwordResetTokensTable).values({
            userId,
            token: tokenHash,
            expiresAt: new Date(Date.now() + 1000 * 60 * 30),
        });

        // Primeiro uso - sucesso
        await app.inject({
            method: "POST",
            url: "/forgot-password",
            payload: {
                token: rawToken,
                newPassword: "firstChange123",
            },
        });

        // Limpa rate limit para a segunda chamada
        const keys = await rateLimitRedis.keys("api-books:rate-limit:*");
        if (keys.length > 0) {
            await rateLimitRedis.del(...keys);
        }

        // Segundo uso - deve falhar
        const response = await app.inject({
            method: "POST",
            url: "/forgot-password",
            payload: {
                token: rawToken,
                newPassword: "secondChange123",
            },
        });

        expect(response.statusCode).toBe(400);
    });

    it("should return 400 with invalid token", async () => {
        const response = await app.inject({
            method: "POST",
            url: "/forgot-password",
            payload: {
                token: "invalid-token-never-created",
                newPassword: "validPassword123",
            },
        });

        expect(response.statusCode).toBe(400);
    });

    it("should return 400 when token is expired", async () => {
        const rawToken = randomBytes(32).toString("hex");
        const tokenHash = createHash("sha256").update(rawToken).digest("hex");

        await db.insert(passwordResetTokensTable).values({
            userId,
            token: tokenHash,
            expiresAt: new Date(Date.now() - 1000 * 60), // expirado há 1 minuto
        });

        const response = await app.inject({
            method: "POST",
            url: "/forgot-password",
            payload: {
                token: rawToken,
                newPassword: "validPassword123",
            },
        });

        expect(response.statusCode).toBe(400);
    });

    it("should return 400 when newPassword is less than 6 characters", async () => {
        const response = await app.inject({
            method: "POST",
            url: "/forgot-password",
            payload: {
                token: "any-token",
                newPassword: "123",
            },
        });

        expect(response.statusCode).toBe(400);
    });

    it("should return 400 when token is missing", async () => {
        const response = await app.inject({
            method: "POST",
            url: "/forgot-password",
            payload: {
                newPassword: "validPassword123",
            },
        });

        expect(response.statusCode).toBe(400);
    });
});
