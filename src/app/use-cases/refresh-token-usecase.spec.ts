import { describe, expect, it, beforeEach } from "vitest";
import { signUpUseCase } from "./sign-up-usecase";
import { InMemoryUsersRepository } from "../repositories/in-memory/in-memory-users-repository";
import { signInUseCase } from "./sign-in-usecase";
import { refreshTokenUseCase } from "./refresh-token-usecase";

let usersRepository: InMemoryUsersRepository;

describe("refresh token use case", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
  });

  it("should be able to refresh a token", async () => {
    await signUpUseCase(
      {
        name: "John Doe",
        username: "johndoe",
        email: "john.doe@example.com",
        password: "password123",
        bio: "I am John Doe",
      },
      usersRepository,
    );

    const { refreshToken } = await signInUseCase(
      {
        email: "john.doe@example.com",
        password: "password123",
      },
      usersRepository,
    );

    const result = await refreshTokenUseCase({
      refreshToken,
    });

    expect(result).toEqual({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    });
  });
  it("should not be able to refresh a token with invalid refresh token", async () => {
    await expect(
      refreshTokenUseCase({
        refreshToken: "invalid-refresh-token",
      }),
    ).rejects.toThrow();
  });
});
