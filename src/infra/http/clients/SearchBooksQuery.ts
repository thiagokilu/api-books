import type { OpenLibraryClient } from "../../../app/use-cases/search-books-usecase";

export function makeOpenLibraryClient(): OpenLibraryClient {
  return {
    async searchBooks(query: string) {
      const response = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`,
        {
          headers: {
            "User-Agent": "API-Books (seu-email@email.com)",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to search books on Open Library");
      }

      return response.json();
    },
  };
}
