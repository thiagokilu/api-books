import type { BooksRepository } from "../repositories/books-repository";
import type { UsersRepository } from "../repositories/users-repository";

export class UserNotFoundError extends Error {
  constructor() {
    super("User not found");
  }
}

export interface IBookShelfResponse {
  user: {
    name: string;
    username: string;
    bio: string | null;
  };
  books: {
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

export async function showPublicBookShelfUseCase(
  username: string,
  usersRepository: UsersRepository,
  booksRepository: BooksRepository,
): Promise<IBookShelfResponse> {
  const user = await usersRepository.findByUsername(username);

  if (!user) {
    throw new UserNotFoundError();
  }

  const books = await booksRepository.showBooksFromShelf({ userId: user.id });

  return {
    user: {
      name: user.name,
      username: user.username,
      bio: user.bio ?? null,
    },
    books: books.map((book) => ({
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
