import type { BooksRepository } from "../repositories/books-repository";
import type { UsersRepository } from "../repositories/users-repository";

export interface IEditBookReadingStatusRequest {
  userId: string;
  id: string;
  readingStatus: "WANT_TO_READ" | "READING" | "COMPLETED";
  currentPage: number;
}

export async function editBookReadingStatusUseCase(
  data: IEditBookReadingStatusRequest,
  booksRepository: BooksRepository,
  usersRepository: UsersRepository,
): Promise<void> {
  const user = await usersRepository.findById(data.userId);

  if (!user) {
    throw new Error("User not found");
  }

  await booksRepository.editReadingStatus(data);
}
