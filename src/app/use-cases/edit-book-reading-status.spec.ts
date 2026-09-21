import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryBooksRepository } from "../repositories/in-memory/in-memory-books-repository";
import { InMemoryUsersRepository } from "../repositories/in-memory/in-memory-users-repository";
import { editBookReadingStatusUseCase } from "./edit-book-reading-status-usecase";

let booksRepository: InMemoryBooksRepository;
let usersRepository: InMemoryUsersRepository;

describe("editBookReadingStatusUseCase", () => {
  beforeEach(() => {
    booksRepository = new InMemoryBooksRepository();
    usersRepository = new InMemoryUsersRepository();
  });

  it("should be able to edit the reading status of a book in the user's shelf", async () => {
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

    await editBookReadingStatusUseCase(
      {
        userId: user.id,
        cover_i: 8065615,
        readingStatus: "READING",
      },
      booksRepository,
      usersRepository,
    );

    const books = await booksRepository.showBooksFromShelf({ userId: user.id });
    expect(books[0]?.status).toBe("READING");
  });

  it("should throw an error if the user does not exist", async () => {
    await expect(
      editBookReadingStatusUseCase(
        {
          userId: "non-existent-user-id",
          cover_i: 8065615,
          readingStatus: "READING",
        },
        booksRepository,
        usersRepository,
      ),
    ).rejects.toThrowError("User not found");
  });
});
