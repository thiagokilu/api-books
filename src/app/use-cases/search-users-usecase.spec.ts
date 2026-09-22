import { describe, expect, it, beforeEach } from "vitest";
import { signUpUseCase } from "./sign-up-usecase";
import { InMemoryUsersRepository } from "../repositories/in-memory/in-memory-users-repository";
import { searchUsersUseCase } from "./search-users-usecase";
import "dotenv/config";

let usersRepository: InMemoryUsersRepository;

describe("SearchUsersUseCase", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
  });

  it("should be able to search users by username", async () => {
    await signUpUseCase(
      {
        name: "Thiago",
        username: "thiago",
        email: "thiago@example.com",
        password: "password123",
        bio: "I am Thiago",
      },
      usersRepository,
    );

    await signUpUseCase(
      {
        name: "Thiago Santos",
        username: "thiagosantos",
        email: "thiagosantos@example.com",
        password: "password123",
        bio: "I am Thiago Santos",
      },
      usersRepository,
    );

    const result = await searchUsersUseCase(
      {
        username: "thiago",
      },
      usersRepository,
    );

    expect(result.users).toHaveLength(2);
    expect(result.users).toContainEqual({
      id: expect.any(String),
      username: "thiago",
    });
    expect(result.users).toContainEqual({
      id: expect.any(String),
      username: "thiagosantos",
    });
  });

  it("should return empty array when no users match", async () => {
    const result = await searchUsersUseCase(
      {
        username: "nonexistent",
      },
      usersRepository,
    );

    expect(result.users).toEqual([]);
  });
});