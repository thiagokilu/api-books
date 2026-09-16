import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryBooksRepository } from "../repositories/in-memory/in-memory-books-repository";
import { InMemoryUsersRepository } from "../repositories/in-memory/in-memory-users-repository";
import {} from "./edit-book-current-page-usecase";

let booksRepository: InMemoryBooksRepository;
let usersRepository: InMemoryUsersRepository;

describe("editBookReadingPageUseCase", () => {
  beforeEach(() => {
    booksRepository = new InMemoryBooksRepository();
    usersRepository = new InMemoryUsersRepository();
  });

  it("should be able to edit the current page of a book in the user's shelf", async () => {
    const user = await usersRepository.create({
      name: "John Doe",
      username: "johndoe",
      email: "johndoe@example.com",
      password: "password123",
    });

    await booksRepository.addBookToShelf({
      userId: user.id,
      title: "Clean Code",
      author_name: ["Robert C. Martin"],
      cover_i: 8065615,
    });

    await booksRepository.editBookCurrentPage({
      userId: user.id,
      cover_i: 8065615,
      currentPage: 100,
    });

    const books = await booksRepository.showBooksFromShelf({ userId: user.id });
    expect(books[0]?.currentPage).toBe(100);
  });
});
