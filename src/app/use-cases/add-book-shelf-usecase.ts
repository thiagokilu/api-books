import type { BooksRepository } from "../repositories/books-repository";
import type { UsersRepository } from "../repositories/users-repository";

interface IBookShelfRequest {
  userId: string;
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
}

export interface IBookShelfResponse {
  userId: string;
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
    ...(data.subtitle ? { subtitle: data.subtitle } : {}),
    authors: data.authors,
    ...(data.coverUrl ? { coverUrl: data.coverUrl } : {}),
    ...(data.description ? { description: data.description } : {}),
    ...(data.publisher ? { publisher: data.publisher } : {}),
    ...(data.language ? { language: data.language } : {}),
    ...(data.publishedDate ? { publishedDate: data.publishedDate } : {}),
    ...(data.publishedYear !== undefined
      ? { publishedYear: data.publishedYear }
      : {}),
    ...(data.categories ? { categories: data.categories } : {}),
    ...(data.isbn ? { isbn: data.isbn } : {}),
    ...(data.infoLink ? { infoLink: data.infoLink } : {}),
    ...(data.pageCount !== undefined ? { totalPages: data.pageCount } : {}),
  });

  return {
    userId: data.userId,
    id: data.id,
    title: data.title,
    ...(data.subtitle ? { subtitle: data.subtitle } : {}),
    authors: data.authors,
    ...(data.coverUrl ? { coverUrl: data.coverUrl } : {}),
    ...(data.description ? { description: data.description } : {}),
    ...(data.publisher ? { publisher: data.publisher } : {}),
    ...(data.language ? { language: data.language } : {}),
    ...(data.publishedDate ? { publishedDate: data.publishedDate } : {}),
    ...(data.publishedYear !== undefined
      ? { publishedYear: data.publishedYear }
      : {}),
    ...(data.categories ? { categories: data.categories } : {}),
    ...(data.isbn ? { isbn: data.isbn } : {}),
    ...(data.infoLink ? { infoLink: data.infoLink } : {}),
    ...(data.pageCount !== undefined ? { pageCount: data.pageCount } : {}),
  };
}
