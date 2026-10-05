import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  searchBooksUseCase,
  type GoogleBooksClient,
} from "./search-books-usecase";

let googleBooksClient: GoogleBooksClient;
let searchBooks: ReturnType<typeof searchBooksUseCase>;

describe("SearchBooksUseCase", () => {
  beforeEach(() => {
    googleBooksClient = {
      searchBooks: vi.fn(),
    };
    searchBooks = searchBooksUseCase(googleBooksClient);
  });

  it("should be able to search books by query", async () => {
    const mockResponse = {
      totalItems: 1,
      items: [
        {
          id: "book1",
          volumeInfo: {
            title: "The Lord of the Rings",
            authors: ["J.R.R. Tolkien"],
            publishedDate: "1954",
            categories: ["Fantasy"],
          },
        },
      ],
    };

    vi.mocked(googleBooksClient.searchBooks).mockResolvedValue(mockResponse);

    const result = await searchBooks({ query: "the lord of the rings" });

    expect(googleBooksClient.searchBooks).toHaveBeenCalledTimes(1);
    expect(googleBooksClient.searchBooks).toHaveBeenCalledWith(
      "the lord of the rings",
      0,
      20,
    );
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.totalPages).toBe(1);
    expect(result.books).toHaveLength(1);
    expect(result.books[0]?.title).toBe("The Lord of the Rings");
  });

  it("should propagate error when client throws an error", async () => {
    vi.mocked(googleBooksClient.searchBooks).mockRejectedValue(
      new Error("Failed to search books on Google Books"),
    );

    await expect(searchBooks({ query: "error-query" })).rejects.toThrow(
      "Failed to search books on Google Books",
    );
  });
});
