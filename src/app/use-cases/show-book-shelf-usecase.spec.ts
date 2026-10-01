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
      id: "clean-code",
      title: "Clean Code",
      authors: ["Robert C. Martin"],
      status: "WANT_TO_READ" as const,
      currentPage: 0,
      totalPages: 0,
    };

    await booksRepository.addBookToShelf(book);

    const result = await showBookShelfUseCase(booksRepository, userId);

    expect(result).toEqual({
      books: [{ ...book, readingPercentage: 0 }],
    });
  });

  it("should only show books from the requested user's shelf", async () => {
    await booksRepository.addBookToShelf({
      userId: "user-1",
      id: "clean-code",
      title: "Clean Code",
      authors: ["Robert C. Martin"],
      status: "WANT_TO_READ" as const,
      currentPage: 0,
    });

    const result = await showBookShelfUseCase(booksRepository, "user-2");

    expect(result).toEqual({ books: [] });
  });
});
