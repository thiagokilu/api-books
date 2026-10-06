import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  findBookByIdUseCase,
  type FindBookByIdClient,
  type GoogleBooksVolume,
} from "./find-book-by-id-usecase";

let googleBooksClient: FindBookByIdClient;
let findBookById: ReturnType<typeof findBookByIdUseCase>;

describe("FindBookByIdUseCase", () => {
  beforeEach(() => {
    googleBooksClient = {
      findBookById: vi.fn(),
    };
    findBookById = findBookByIdUseCase(googleBooksClient);
  });

  it("should be able to find a book by id", async () => {
    const mockVolume: GoogleBooksVolume = {
      id: "book1",
      volumeInfo: {
        title: "The Lord of the Rings",
        authors: ["J.R.R. Tolkien"],
        publishedDate: "1954",
        categories: ["Fantasy"],
        publisher: "Allen & Unwin",
        pageCount: 1178,
        language: "en",
        description: "An epic high-fantasy novel",
        imageLinks: {
          thumbnail: "http://example.com/cover.jpg",
        },
        industryIdentifiers: [
          { type: "ISBN_13", identifier: "978-0261103573" },
        ],
        infoLink: "http://books.google.com/books?id=book1",
      },
    };

    vi.mocked(googleBooksClient.findBookById).mockResolvedValue(mockVolume);

    const result = await findBookById({ id: "book1" });

    expect(googleBooksClient.findBookById).toHaveBeenCalledTimes(1);
    expect(googleBooksClient.findBookById).toHaveBeenCalledWith("book1");
    expect(result.book.id).toBe("book1");
    expect(result.book.title).toBe("The Lord of the Rings");
    expect(result.book.authors).toEqual(["J.R.R. Tolkien"]);
    expect(result.book.publishedYear).toBe(1954);
    expect(result.book.categories).toEqual(["Fantasy"]);
    expect(result.book.publisher).toBe("Allen & Unwin");
    expect(result.book.pageCount).toBe(1178);
    expect(result.book.language).toBe("en");
    expect(result.book.description).toBe("An epic high-fantasy novel");
    expect(result.book.coverUrl).toBe("https://example.com/cover.jpg");
    expect(result.book.isbn).toBe("978-0261103573");
    expect(result.book.infoLink).toBe("http://books.google.com/books?id=book1");
  });

  it("should handle book with minimal data", async () => {
    const mockVolume: GoogleBooksVolume = {
      id: "book2",
      volumeInfo: {
        title: "Minimal Book",
      },
    };

    vi.mocked(googleBooksClient.findBookById).mockResolvedValue(mockVolume);

    const result = await findBookById({ id: "book2" });

    expect(result.book.id).toBe("book2");
    expect(result.book.title).toBe("Minimal Book");
    expect(result.book.authors).toEqual([]);
    expect(result.book.categories).toEqual([]);
    expect(result.book.publishedYear).toBeUndefined();
    expect(result.book.publisher).toBeUndefined();
  });

  it("should propagate error when client throws an error", async () => {
    vi.mocked(googleBooksClient.findBookById).mockRejectedValue(
      new Error("Failed to find book on Google Books"),
    );

    await expect(findBookById({ id: "error-id" })).rejects.toThrow(
      "Failed to find book on Google Books",
    );
  });

  it("should extract ISBN_13 when available", async () => {
    const mockVolume: GoogleBooksVolume = {
      id: "book3",
      volumeInfo: {
        title: "Book with ISBN",
        industryIdentifiers: [
          { type: "ISBN_10", identifier: "0261103577" },
          { type: "ISBN_13", identifier: "978-0261103573" },
        ],
      },
    };

    vi.mocked(googleBooksClient.findBookById).mockResolvedValue(mockVolume);

    const result = await findBookById({ id: "book3" });

    expect(result.book.isbn).toBe("978-0261103573");
  });

  it("should fallback to ISBN_10 when ISBN_13 is not available", async () => {
    const mockVolume: GoogleBooksVolume = {
      id: "book4",
      volumeInfo: {
        title: "Book with ISBN 10 only",
        industryIdentifiers: [
          { type: "ISBN_10", identifier: "0261103577" },
        ],
      },
    };

    vi.mocked(googleBooksClient.findBookById).mockResolvedValue(mockVolume);

    const result = await findBookById({ id: "book4" });

    expect(result.book.isbn).toBe("0261103577");
  });

  it("should convert http to https for cover URL", async () => {
    const mockVolume: GoogleBooksVolume = {
      id: "book5",
      volumeInfo: {
        title: "Book with HTTP cover",
        imageLinks: {
          thumbnail: "http://example.com/cover.jpg",
        },
      },
    };

    vi.mocked(googleBooksClient.findBookById).mockResolvedValue(mockVolume);

    const result = await findBookById({ id: "book5" });

    expect(result.book.coverUrl).toBe("https://example.com/cover.jpg");
  });
});
