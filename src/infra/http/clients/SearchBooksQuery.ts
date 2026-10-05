import type { GoogleBooksClient } from "../../../app/use-cases/search-books-usecase";

export function makeGoogleBooksClient(): GoogleBooksClient {
  return {
    async searchBooks(query: string, startIndex: number, maxResults: number) {
      const params = new URLSearchParams({
        q: query,
        startIndex: String(startIndex),
        maxResults: String(maxResults),
      });

      // Opcional, mas recomendado
      if (process.env.GOOGLE_BOOKS_API_KEY) {
        params.set("key", process.env.GOOGLE_BOOKS_API_KEY);
      }

      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?${params.toString()}`,
      );

      if (!response.ok) {
        throw new Error("Failed to search books on Google Books");
      }

      return response.json();
    },
  };
}
