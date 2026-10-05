import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  vi,
} from "vitest";
import { app } from "../src/server";
import { rateLimitRedis } from "../src/infra/lib/rateLimit";

describe("Search Books (E2E)", () => {
  beforeAll(async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          totalItems: 1,
          items: [
            {
              id: "clean-code",
              volumeInfo: {
                title: "Clean Code",
                authors: ["Robert C. Martin"],
              },
            },
          ],
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      ),
    );
    await app.ready();
  });

  beforeEach(async () => {
    // limpa rate-limit de forma mais específica para este endpoint
    const keys = await rateLimitRedis.keys(
      "api-books:rate-limit:*books/search*",
    );
    if (keys.length > 0) {
      await rateLimitRedis.del(...keys);
    }
  });

  afterAll(async () => {
    await app.close();
    vi.restoreAllMocks();
  });

  it("should search books by query successfully and return 200", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/books/search?query=clean+code",
    });

    if (response.statusCode !== 200) {
      console.log("Response body:", response.json());
    }

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body).toHaveProperty("total");
    expect(body).toMatchObject({ page: 1, limit: 20, totalPages: 1 });
    expect(body).toHaveProperty("books");
    expect(Array.isArray(body.books)).toBe(true);
  });

  it("should return 400 when query parameter is missing", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/books/search",
    });

    expect(response.statusCode).toBe(400);
  });
});
