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
    title: string;
    author_name: string[];
    cover_i: number;
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
      title: book.title,
      author_name: book.author_name,
      cover_i: book.cover_i,
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
