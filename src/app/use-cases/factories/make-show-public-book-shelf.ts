import { DrizzleBooksRepository } from "../../repositories/drizzle/drizzle-books-repository";
import { DrizzleUsersRepository } from "../../repositories/drizzle/drizzle-users-repository";
import { showPublicBookShelfUseCase } from "../show-public-book-shelf-usecase";

export function makeShowPublicBookShelfUseCase() {
  const usersRepository = new DrizzleUsersRepository();
  const booksRepository = new DrizzleBooksRepository();
  return (username: string) =>
    showPublicBookShelfUseCase(username, usersRepository, booksRepository);
}
