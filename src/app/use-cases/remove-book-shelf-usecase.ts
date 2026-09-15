import type { BooksRepository } from "../repositories/books-repository";
import type { UsersRepository } from "../repositories/users-repository";

export async function removeBookShelfUseCase(
  data: { userId: string; cover_i: number },
  booksRepository: BooksRepository,
  usersRepository: UsersRepository,
): Promise<void> {
  const user = await usersRepository.findById(data.userId);
  if (!user) {
    throw new Error("User not found");
  }
  await booksRepository.removeBookFromShelf(data);
}
