import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
import { app } from "../src/server";
import { rateLimitRedis } from "../src/infra/lib/rateLimit";
import { db } from "../src/index";
import { usersTable, passwordResetTokensTable } from "../src/infra/db/schema";
import { eq } from "drizzle-orm";
import { DrizzleUsersRepository } from "../src/app/repositories/drizzle/drizzle-users-repository";

const mockSend = vi.fn();

vi.mock("resend", () => {
    return {
        Resend: class {
            emails = {
                send: mockSend,
            };
        },
    };
});

const TEST_EMAIL = "request_pwd_e2e@email.com";
const TEST_USERNAME = "request_pwd_user";

describe("Request Password (E2E)", () => {
    let userId: string;

    beforeAll(async () => {
        await app.ready();

        const usersRepository = new DrizzleUsersRepository();

        // Limpa resquícios se houver
        const existingUser = await usersRepository.findByEmail(TEST_EMAIL);
        if (existingUser) {
            await db.delete(passwordResetTokensTable).where(eq(passwordResetTokensTable.userId, existingUser.id));
            await db.delete(usersTable).where(eq(usersTable.id, existingUser.id));
        }

        const user = await usersRepository.create({
            name: "Request Pwd User",
            username: TEST_USERNAME,
            email: TEST_EMAIL,
            password: "hashedpassword123",
        });

        userId = user.id;
    });

    beforeEach(async () => {
        vi.clearAllMocks();
        mockSend.mockResolvedValue({ error: null, data: { id: "email-id" } });

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

    it("should request password reset for existing user and return 200", async () => {
        const response = await app.inject({
            method: "POST",
            url: "/request-password",
            payload: {
                email: TEST_EMAIL,
            },
        });

        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual({
            message: "If an account exists for this email, you will receive reset instructions.",
        });

        // Verifica se o token foi gravado no banco de dados
        const tokens = await db
            .select()
            .from(passwordResetTokensTable)
            .where(eq(passwordResetTokensTable.userId, userId));

        expect(tokens).toHaveLength(1);
        expect(tokens[0].token).toBeDefined();
        expect(new Date(tokens[0].expiresAt).getTime()).toBeGreaterThan(Date.now());

        // Verifica se o e-mail foi disparado com o link contendo o token
        expect(mockSend).toHaveBeenCalledWith(
            expect.objectContaining({
                to: [TEST_EMAIL],
                subject: "Redefinição de senha",
            }),
        );
    });

    it("should return 200 with generic message if user is not found without saving token or sending email", async () => {
        const response = await app.inject({
            method: "POST",
            url: "/request-password",
            payload: {
                email: "nonexistent_email_12345@example.com",
            },
        });

        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual({
            message: "If an account exists for this email, you will receive reset instructions.",
        });

        expect(mockSend).not.toHaveBeenCalled();
    });

    it("should return 400 when email is invalid format", async () => {
        const response = await app.inject({
            method: "POST",
            url: "/request-password",
            payload: {
                email: "not-an-email",
            },
        });

        expect(response.statusCode).toBe(400);
    });

    it("should return 400 when payload is empty", async () => {
        const response = await app.inject({
            method: "POST",
            url: "/request-password",
            payload: {},
        });

        expect(response.statusCode).toBe(400);
    });
});
