import type { BooksRepository } from "../repositories/books-repository";
import type { UsersRepository } from "../repositories/users-repository";

interface IEditBookReadingPageRequest {
  userId: string;
  cover_i: number;
  currentPage: number;
}

export interface IEditBookReadingPageResponse {
  currentPage: number;
  message: string;
}

export async function editBookReadingPageUseCase(
  data: IEditBookReadingPageRequest,
  booksRepository: BooksRepository,
  usersRepository: UsersRepository,
): Promise<IEditBookReadingPageResponse> {
  const user = await usersRepository.findById(data.userId);

  if (!user) {
    throw new Error("User not found");
  }

  await booksRepository.editBookCurrentPage(data);

  return {
    currentPage: data.currentPage,
    message: "Book current page updated successfully",
  };
}
