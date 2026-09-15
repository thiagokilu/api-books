import type { BooksRepository } from "../repositories/books-repository";

export interface IBookShelfResponse {
  books: {
    title: string;
    author_name: string[];
    cover_i: number;
  }[];
}

export async function showBookShelfUseCase(
  booksRepository: BooksRepository,
  userId: string,
): Promise<IBookShelfResponse> {
  const books = await booksRepository.showBooksFromShelf({ userId });

  return {
    books,
  };
}
