import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import fastify from "fastify";
import cookie from "@fastify/cookie";
import fastifyRateLimit from "@fastify/rate-limit";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { validatorCompiler, serializerCompiler } from "fastify-type-provider-zod";
import { rateLimitRedis } from "./rateLimit";
import { signInRoute } from "../http/routes/sign-in-route";
import type { FastifyInstance } from "fastify";

describe("Sign in rate limit (E2E)", () => {
    let rateLimitedApp: FastifyInstance;
    let originalNodeEnv: string | undefined;

    beforeAll(async () => {
        // Save original NODE_ENV and set to development to enable rate limiting
        originalNodeEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = "development";

        // Create a separate app instance with rate limiting enabled
        rateLimitedApp = fastify();

        // Set up compilers for Zod
        rateLimitedApp.setValidatorCompiler(validatorCompiler);
        rateLimitedApp.setSerializerCompiler(serializerCompiler);

        // Register cookie plugin (required by sign-in controller)
        await rateLimitedApp.register(cookie);

        // Register rate limiting
        await rateLimitedApp.register(fastifyRateLimit, {
            redis: rateLimitRedis,
            nameSpace: "api-books:rate-limit:",
            max: 100,
            timeWindow: 1000 * 60 * 60, // 1 hour
        });

        // Register sign-in route with type provider
        const typedApp = rateLimitedApp.withTypeProvider<ZodTypeProvider>();
        typedApp.register(signInRoute);

        await rateLimitedApp.ready();
    });

    beforeEach(async () => {
        const keys = await rateLimitRedis.keys("api-books:rate-limit:*");
        if (keys.length > 0) {
            await rateLimitRedis.del(...keys);
        }
    });

    afterAll(async () => {
        // Restore original NODE_ENV
        if (originalNodeEnv !== undefined) {
            process.env.NODE_ENV = originalNodeEnv;
        }
        await rateLimitedApp.close();
        await rateLimitRedis.quit();
    });

    it("should block requests after reaching the rate limit", async () => {
        const requests = [];

        for (let i = 0; i < 6; i++) {
            const response = await rateLimitedApp.inject({
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