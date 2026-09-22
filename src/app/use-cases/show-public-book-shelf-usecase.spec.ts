import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryBooksRepository } from "../repositories/in-memory/in-memory-books-repository";
import { InMemoryUsersRepository } from "../repositories/in-memory/in-memory-users-repository";
import {
  UserNotFoundError,
  showPublicBookShelfUseCase,
} from "./show-public-book-shelf-usecase";

let booksRepository: InMemoryBooksRepository;
let usersRepository: InMemoryUsersRepository;

describe("showPublicBookShelfUseCase", () => {
  beforeEach(() => {
    booksRepository = new InMemoryBooksRepository();
    usersRepository = new InMemoryUsersRepository();
  });

  it("should be able to show public bookshelf for a user", async () => {
    const user = await usersRepository.create({
      name: "Thiago",
      username: "thiago",
      email: "thiago@example.com",
      password: "hashed-password",
      bio: "Leitor de ficção",
    });

    const book = {
      userId: user.id,
      title: "Clean Code",
      author_name: ["Robert C. Martin"],
      cover_i: 8065615,
      status: "READING" as const,
      currentPage: 50,
      totalPages: 200,
    };

    await booksRepository.addBookToShelf(book);

    const result = await showPublicBookShelfUseCase(
      "thiago",
      usersRepository,
      booksRepository,
    );

    expect(result).toEqual({
      user: {
        name: "Thiago",
        username: "thiago",
        bio: "Leitor de ficção",
      },
      books: [
        {
          title: "Clean Code",
          author_name: ["Robert C. Martin"],
          cover_i: 8065615,
          status: "READING",
          currentPage: 50,
          totalPages: 200,
          readingPercentage: 25,
        },
      ],
    });
  });

  it("should throw UserNotFoundError when user does not exist", async () => {
    await expect(
      showPublicBookShelfUseCase(
        "nonexistent",
        usersRepository,
        booksRepository,
      ),
    ).rejects.toBeInstanceOf(UserNotFoundError);
  });

  it("should return empty books array when user has no books", async () => {
    await usersRepository.create({
      name: "Ana",
      username: "ana",
      email: "ana@example.com",
      password: "hashed-password",
      bio: null,
    });

    const result = await showPublicBookShelfUseCase(
      "ana",
      usersRepository,
      booksRepository,
    );

    expect(result).toEqual({
      user: {
        name: "Ana",
        username: "ana",
        bio: null,
      },
      books: [],
    });
  });
});
