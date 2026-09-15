import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryBooksRepository } from "../repositories/in-memory/in-memory-books-repository";
import { showBookShelfUseCase } from "./show-book-shelf-usecase";

let booksRepository: InMemoryBooksRepository;

describe("showBookShelfUseCase", () => {
  beforeEach(() => {
    booksRepository = new InMemoryBooksRepository();
  });

  it("should be able to show books from the user's shelf", async () => {
    const userId = "user-1";
    const book = {
      userId,
      title: "Clean Code",
      author_name: ["Robert C. Martin"],
      cover_i: 8065615,
      status: "WANT_TO_READ" as const,
    };

    await booksRepository.addBookToShelf(book);

    const result = await showBookShelfUseCase(booksRepository, userId);

    expect(result).toEqual({
      books: [book],
    });
  });

  it("should only show books from the requested user's shelf", async () => {
    await booksRepository.addBookToShelf({
      userId: "user-1",
      title: "Clean Code",
      author_name: ["Robert C. Martin"],
      cover_i: 8065615,
    });

    const result = await showBookShelfUseCase(booksRepository, "user-2");

    expect(result).toEqual({ books: [] });
  });
});
