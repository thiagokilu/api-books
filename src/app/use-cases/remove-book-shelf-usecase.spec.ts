import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryBooksRepository } from "../repositories/in-memory/in-memory-books-repository";
import { InMemoryUsersRepository } from "../repositories/in-memory/in-memory-users-repository";
import { removeBookShelfUseCase } from "./remove-book-shelf-usecase";

let booksRepository: InMemoryBooksRepository;
let usersRepository: InMemoryUsersRepository;

describe("removeBookShelfUseCase", () => {
  beforeEach(() => {
    booksRepository = new InMemoryBooksRepository();
    usersRepository = new InMemoryUsersRepository();
  });

  it("should be able to remove a book from the user's shelf", async () => {
    const user = await usersRepository.create({
      name: "John Doe",
      username: "johndoe",
      email: "john.doe@example.com",
      password: "password123",
    });
    const book = {
      userId: user.id,
      id: "clean-code",
      title: "Clean Code",
      authors: ["Robert C. Martin"],
    };

    await booksRepository.addBookToShelf(book);
    await removeBookShelfUseCase(
      { userId: user.id, id: book.id },
      booksRepository,
      usersRepository,
    );

    await expect(
      booksRepository.showBooksFromShelf({ userId: user.id }),
    ).resolves.toEqual([]);
  });

  it("should not be able to remove a book for a non-existent user", async () => {
    await expect(
      removeBookShelfUseCase(
        { userId: "non-existent-user", id: "clean-code" },
        booksRepository,
        usersRepository,
      ),
    ).rejects.toThrow("User not found");
  });
});
