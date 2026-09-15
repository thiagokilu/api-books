import { DrizzleBooksRepository } from "../../repositories/drizzle/drizzle-books-repository";
import { DrizzleUsersRepository } from "../../repositories/drizzle/drizzle-users-repository";
import { removeBookShelfUseCase } from "../remove-book-shelf-usecase";

export function makeRemoveBookShelfUseCase() {
  const booksRepository = new DrizzleBooksRepository();
  const usersRepository = new DrizzleUsersRepository();
  return (data: Parameters<typeof removeBookShelfUseCase>[0]) =>
    removeBookShelfUseCase(data, booksRepository, usersRepository);
}
