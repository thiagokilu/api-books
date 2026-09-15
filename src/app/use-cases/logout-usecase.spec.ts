import { beforeEach, describe, expect, it, vi } from "vitest";
import { InMemoryTokensRepository } from "../repositories/in-memory/in-memory-tokens-repository";
import { LogoutUseCase } from "./logout-usecase";

let tokensRepository: InMemoryTokensRepository;

describe("LogoutUseCase", () => {
  beforeEach(() => {
    tokensRepository = new InMemoryTokensRepository();
  });

  it("should remove user refresh token from redis", async () => {
    const userId = "user-test-id";
    await tokensRepository.saveRefreshToken(userId, "sample-refresh-token");

    const tokenBeforeLogout = await tokensRepository.getRefreshToken(userId);
    expect(tokenBeforeLogout).toBe("sample-refresh-token");

    await LogoutUseCase({ userId }, tokensRepository);

    expect(await tokensRepository.getRefreshToken(userId)).toBeNull();
  });

  it("should delete the refresh token for the user", async () => {
    const userId = "another-user-id";
    const deleteRefreshTokenSpy = vi.spyOn(
      tokensRepository,
      "deleteRefreshToken",
    );

    await LogoutUseCase({ userId }, tokensRepository);

    expect(deleteRefreshTokenSpy).toHaveBeenCalledWith(userId);
  });
});
