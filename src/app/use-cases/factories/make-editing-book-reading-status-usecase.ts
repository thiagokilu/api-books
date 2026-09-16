import { DrizzleBooksRepository } from "../../repositories/drizzle/drizzle-books-repository";
import { DrizzleUsersRepository } from "../../repositories/drizzle/drizzle-users-repository";
import { editBookReadingStatusUseCase } from "../edit-book-reading-status-usecase";

export function makeEditBookReadingStatusUseCase() {
  const booksRepository = new DrizzleBooksRepository();
  const usersRepository = new DrizzleUsersRepository();
  return (data: Parameters<typeof editBookReadingStatusUseCase>[0]) =>
    editBookReadingStatusUseCase(data, booksRepository, usersRepository);
}
