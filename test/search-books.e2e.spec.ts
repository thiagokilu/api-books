import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { app } from "../src/server";
import { rateLimitRedis } from "../src/infra/lib/rateLimit";

describe("Search Books (E2E)", () => {
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
    });

    it("should search books by query successfully and return 200", async () => {
        const response = await app.inject({
            method: "GET",
            url: "/books/search?query=clean+code",
        });

        expect(response.statusCode).toBe(200);
        const body = response.json();
        expect(body).toHaveProperty("docs");
        expect(Array.isArray(body.docs)).toBe(true);
    });

    it("should return 400 when query parameter is missing", async () => {
        const response = await app.inject({
            method: "GET",
            url: "/books/search",
        });

        expect(response.statusCode).toBe(400);
    });
});
