import type { BooksRepository } from "../repositories/books-repository";
import type { UsersRepository } from "../repositories/users-repository";

interface IBookShelfRequest {
  userId: string;
  id: string;
  title: string;
  authors: string[];
  coverUrl?: string;
  pageCount?: number;
}

export interface IBookShelfResponse {
  userId: string;
  id: string;
  title: string;
  authors: string[];
  coverUrl?: string;
  pageCount?: number;
}

export async function addBookToShelfUseCase(
  data: IBookShelfRequest,
  booksRepository: BooksRepository,
  usersRepository: UsersRepository,
): Promise<IBookShelfResponse> {
  const user = await usersRepository.findById(data.userId);

  if (!user) {
    throw new Error("User not found");
  }

  await booksRepository.addBookToShelf({
    userId: data.userId,
    id: data.id,
    title: data.title,
    authors: data.authors,
    ...(data.coverUrl ? { coverUrl: data.coverUrl } : {}),
    ...(data.pageCount !== undefined ? { totalPages: data.pageCount } : {}),
  });

  return {
    userId: data.userId,
    id: data.id,
    title: data.title,
    authors: data.authors,
    ...(data.coverUrl ? { coverUrl: data.coverUrl } : {}),
    ...(data.pageCount !== undefined ? { pageCount: data.pageCount } : {}),
  };
}
