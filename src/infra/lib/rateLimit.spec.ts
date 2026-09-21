import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { app } from "./../../server";
import { rateLimitRedis } from "./rateLimit";

describe("Sign in rate limit (E2E)", () => {
    beforeAll(async () => {
        await app.ready();
    });

    beforeEach(async () => {
        const keys = await rateLimitRedis.keys("api-books:rate-limit:*");
        if (keys.length > 0) {
            await rateLimitRedis.del(...keys);
        }
    });

    afterAll(async () => {
        await app.close();
        await rateLimitRedis.quit();
    });

    it("should block requests after reaching the rate limit", async () => {
        const requests = [];

        for (let i = 0; i < 6; i++) {
            const response = await app.inject({
                method: "POST",
                url: "/sign-in",
                payload: {
                    email: "teste@email.com",
                    password: "senhaerrada",
                },
            });

            requests.push(response);
        }

        // Primeiras 5 requisições
        for (let i = 0; i < 5; i++) {
            expect(requests[i]?.statusCode).not.toBe(429);
        }

        // 6ª requisição deve ser bloqueada
        expect(requests[5]?.statusCode).toBe(429);
    });
});