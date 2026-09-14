import type { BooksRepository } from "../repositories/books-repository";
import type { UsersRepository } from "../repositories/users-repository";

interface IBookShelfRequest {
  // "docs": [
  // {
  //     "title": "Clean Code",
  //     "author_name": [
  //         "Robert C. Martin"
  //     ],
  //     "cover_i": 8065615
  // },
  userId: string;
  title: string;
  author_name: string[];
  cover_i: number;
}

export interface IBookShelfResponse {
  userId: string;
  title: string;
  author_name: string[];
  cover_i: number;
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

  await booksRepository.addBookToShelf(data);

  return {
    userId: data.userId,
    title: data.title,
    author_name: data.author_name,
    cover_i: data.cover_i,
  };
}
