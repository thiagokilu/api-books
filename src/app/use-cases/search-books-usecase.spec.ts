import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  searchBooksUseCase,
  type OpenLibraryClient,
} from "./search-books-usecase";

let openLibraryClient: OpenLibraryClient;
let searchBooks: ReturnType<typeof searchBooksUseCase>;

describe("SearchBooksUseCase", () => {
  beforeEach(() => {
    openLibraryClient = {
      searchBooks: vi.fn(),
    };
    searchBooks = searchBooksUseCase(openLibraryClient);
  });

  it("should be able to search books by query", async () => {
    const mockResponse = {
      docs: [
        {
          title: "The Lord of the Rings",
          author_name: ["J.R.R. Tolkien"],
          publish_year: [1954],
        },
      ],
    };

    vi.mocked(openLibraryClient.searchBooks).mockResolvedValue(mockResponse);

    const result = await searchBooks({ query: "the lord of the rings" });

    expect(openLibraryClient.searchBooks).toHaveBeenCalledTimes(1);
    expect(openLibraryClient.searchBooks).toHaveBeenCalledWith(
      "the lord of the rings",
    );
    expect(result).toEqual(mockResponse);
    expect(result.docs).toHaveLength(1);
    expect(result.docs[0]?.title).toBe("The Lord of the Rings");
  });

  it("should propagate error when client throws an error", async () => {
    vi.mocked(openLibraryClient.searchBooks).mockRejectedValue(
      new Error("Failed to search books on Open Library"),
    );

    await expect(
      searchBooks({ query: "error-query" }),
    ).rejects.toThrow("Failed to search books on Open Library");
  });
});
