import { describe, expect, it, beforeEach } from "vitest";
import { signUpUseCase } from "./sign-up-usecase";
import { InMemoryUsersRepository } from "../repositories/in-memory/in-memory-users-repository";
import { InMemoryTokensRepository } from "../repositories/in-memory/in-memory-tokens-repository";
import { signInUseCase } from "./sign-in-usecase";
import { refreshTokenUseCase } from "./refresh-token-usecase";

let usersRepository: InMemoryUsersRepository;
let tokensRepository: InMemoryTokensRepository;

describe("refresh token use case", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    tokensRepository = new InMemoryTokensRepository();
  });

  it("should be able to refresh a token", async () => {
    const user = await signUpUseCase(
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
      tokensRepository,
    );

    await tokensRepository.saveRefreshToken(user.id, refreshToken);

    const result = await refreshTokenUseCase({
      refreshToken,
      tokensRepository,
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
        tokensRepository,
      }),
    ).rejects.toThrow();
  });
});
