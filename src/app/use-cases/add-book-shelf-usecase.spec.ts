import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryBooksRepository } from "../repositories/in-memory/in-memory-books-repository";
import { InMemoryUsersRepository } from "../repositories/in-memory/in-memory-users-repository";
import { addBookToShelfUseCase } from "./add-book-shelf-usecase";

let booksRepository: InMemoryBooksRepository;
let usersRepository: InMemoryUsersRepository;

describe("addBookToShelfUseCase", () => {
  beforeEach(() => {
    booksRepository = new InMemoryBooksRepository();
    usersRepository = new InMemoryUsersRepository();
  });

  it("should be able to add a book to the user's shelf", async () => {
    const user = await usersRepository.create({
      name: "John Doe",
      username: "johndoe",
      email: "john.doe@example.com",
      password: "password123",
    });
    const book = {
      userId: user.id,
      id: "google-books-id-123",
      title: "Clean Code",
      authors: ["Robert C. Martin"],
      coverUrl: "https://example.com/cover.jpg",
      subtitle: "A Handbook of Agile Software Craftsmanship",
      description: "A practical guide to writing clean code.",
      publisher: "Prentice Hall",
      language: "en",
      publishedDate: "2008-08-01",
      publishedYear: 2008,
      categories: ["Computers"],
      isbn: "9780132350884",
      infoLink: "https://books.google.com/books?id=clean-code",
    };

    const result = await addBookToShelfUseCase(
      book,
      booksRepository,
      usersRepository,
    );

    expect(result).toEqual(book);
    await expect(
      booksRepository.showBooksFromShelf({ userId: user.id }),
    ).resolves.toEqual([
      { ...book, status: "WANT_TO_READ", currentPage: 0, totalPages: 0 },
    ]);
  });

  it("should not be able to add a book for a non-existent user", async () => {
    const book = {
      userId: "non-existent-user",
      id: "google-books-id-123",
      title: "Clean Code",
      authors: ["Robert C. Martin"],
      coverUrl: "https://example.com/cover.jpg",
    };

    await expect(
      addBookToShelfUseCase(book, booksRepository, usersRepository),
    ).rejects.toThrow("User not found");

    await expect(
      booksRepository.showBooksFromShelf({ userId: book.userId }),
    ).resolves.toEqual([]);
  });
});
