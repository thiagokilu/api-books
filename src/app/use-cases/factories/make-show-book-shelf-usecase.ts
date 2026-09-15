import { DrizzleBooksRepository } from "../../repositories/drizzle/drizzle-books-repository";
import { showBookShelfUseCase } from "../show-book-shelf-usecase";

export function makeShowBookShelfUseCase() {
  const booksRepository = new DrizzleBooksRepository();
  return (userId: string) => showBookShelfUseCase(booksRepository, userId);
}
