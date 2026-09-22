import type { BooksRepository } from "../repositories/books-repository";

export interface IBookShelfResponse {
  books: {
    title: string;
    author_name: string[];
    cover_i: number;
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
      ...book,
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
