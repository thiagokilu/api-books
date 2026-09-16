import { DrizzleBooksRepository } from "../../repositories/drizzle/drizzle-books-repository";
import { DrizzleUsersRepository } from "../../repositories/drizzle/drizzle-users-repository";
import { editBookReadingPageUseCase } from "../edit-book-current-page-usecase";

export function makeEditBookReadingPageUseCase() {
  const booksRepository = new DrizzleBooksRepository();
  const usersRepository = new DrizzleUsersRepository();
  return (data: Parameters<typeof editBookReadingPageUseCase>[0]) =>
    editBookReadingPageUseCase(data, booksRepository, usersRepository);
}
