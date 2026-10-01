import type { BooksRepository } from "../repositories/books-repository";

export interface IBookShelfResponse {
  books: {
    userId?: string;
    id: string;
    title: string;
    subtitle?: string;
    authors: string[];
    coverUrl?: string;
    description?: string;
    publisher?: string;
    language?: string;
    publishedDate?: string;
    publishedYear?: number;
    categories?: string[];
    isbn?: string;
    infoLink?: string;
    pageCount?: number;
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
      ...(book.subtitle ? { subtitle: book.subtitle } : {}),
      authors: book.authors,
      ...(book.coverUrl ? { coverUrl: book.coverUrl } : {}),
      ...(book.description ? { description: book.description } : {}),
      ...(book.publisher ? { publisher: book.publisher } : {}),
      ...(book.language ? { language: book.language } : {}),
      ...(book.publishedDate ? { publishedDate: book.publishedDate } : {}),
      ...(book.publishedYear !== undefined
        ? { publishedYear: book.publishedYear }
        : {}),
      ...(book.categories ? { categories: book.categories } : {}),
      ...(book.isbn ? { isbn: book.isbn } : {}),
      ...(book.infoLink ? { infoLink: book.infoLink } : {}),
      ...(book.totalPages !== undefined && book.totalPages !== null
        ? { pageCount: book.totalPages }
        : {}),
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
