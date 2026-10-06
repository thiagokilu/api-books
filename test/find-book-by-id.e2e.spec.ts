import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  vi,
} from "vitest";
import { app } from "../src/server";

describe("Find Book By ID (E2E)", () => {
  beforeAll(async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "clean-code",
          volumeInfo: {
            title: "Clean Code",
            authors: ["Robert C. Martin"],
            publishedDate: "2008",
            categories: ["Computers"],
            publisher: "Prentice Hall",
            pageCount: 464,
            language: "en",
            description: "A handbook of agile software craftsmanship",
            imageLinks: {
              thumbnail: "http://example.com/clean-code.jpg",
            },
            industryIdentifiers: [
              { type: "ISBN_13", identifier: "978-0132350884" },
            ],
            infoLink: "http://books.google.com/books?id=clean-code",
          },
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      ),
    );
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    vi.restoreAllMocks();
  });

  it("should find a book by id successfully and return 200", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/books/clean-code",
    });

    if (response.statusCode !== 200) {
      console.log("Response body:", response.json());
    }

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body).toHaveProperty("message");
    expect(body).toHaveProperty("book");
    expect(body.book).toHaveProperty("id");
    expect(body.book).toHaveProperty("title");
    expect(body.book).toHaveProperty("authors");
    expect(Array.isArray(body.book.authors)).toBe(true);
  });

  it("should return 500 when Google Books API fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({ error: "Not found" }),
        {
          status: 404,
          headers: { "content-type": "application/json" },
        },
      ),
    );

    const response = await app.inject({
      method: "GET",
      url: "/books/invalid-id",
    });

    expect(response.statusCode).toBe(500);
    const body = response.json();
    expect(body).toHaveProperty("message");
  });
});
