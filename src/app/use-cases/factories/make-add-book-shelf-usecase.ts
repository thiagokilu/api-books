import { DrizzleBooksRepository } from "../../repositories/drizzle/drizzle-books-repository";
import { DrizzleUsersRepository } from "../../repositories/drizzle/drizzle-users-repository";
import { addBookToShelfUseCase } from "../add-book-shelf-usecase";

export function makeAddBookToShelfUseCase() {
  const booksRepository = new DrizzleBooksRepository();
  const usersRepository = new DrizzleUsersRepository();
  return (data: Parameters<typeof addBookToShelfUseCase>[0]) =>
    addBookToShelfUseCase(data, booksRepository, usersRepository);
}
