import type { BooksRepository } from "../repositories/books-repository";

export interface IBookShelfResponse {
  books: {
    userId?: string;
    id: string;
    title: string;
    authors: string[];
    coverUrl?: string;
    status: "WANT_TO_READ" | "READING" | "COMPLETED";
    currentPage?: number;
    totalPages?: number;
    readingPercentage?: number;
  }[];
}

export async function showBookShelfUseCase(
  booksRepository: BooksRepository,
  userId: string,
): Promise<IBookShelfResponse> {
  const books = await booksRepository.showBooksFromShelf({ userId });

  return {
    books: books.map((book) => ({
      userId: book.userId,
      id: book.id,
      title: book.title,
      authors: book.authors,
      ...(book.coverUrl ? { coverUrl: book.coverUrl } : {}),
      status: book.status ?? "WANT_TO_READ",
      currentPage: book.currentPage ?? 0,
      totalPages: book.totalPages ?? 0,
      readingPercentage:
        book.currentPage && book.totalPages && book.totalPages > 0
          ? Math.round((book.currentPage / book.totalPages) * 100)
          : 0,
    })),
  };
}
