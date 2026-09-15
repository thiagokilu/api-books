import { describe, expect, it, vi } from "vitest";
import { redis } from "../../infra/lib/redis";
import { LogoutUseCase } from "./logout-usecase";

describe("LogoutUseCase", () => {
  it("should remove user refresh token from redis", async () => {
    const userId = "user-test-id";
    await redis.set(`refresh-token:${userId}`, "sample-refresh-token");

    const tokenBeforeLogout = await redis.get(`refresh-token:${userId}`);
    expect(tokenBeforeLogout).toBe("sample-refresh-token");

    await LogoutUseCase({ userId });

    const tokenAfterLogout = await redis.get(`refresh-token:${userId}`);
    expect(tokenAfterLogout).toBeNull();
  });

  it("should call redis.del with the correct key", async () => {
    const userId = "another-user-id";
    const delSpy = vi.spyOn(redis, "del");

    await LogoutUseCase({ userId });

    expect(delSpy).toHaveBeenCalledWith(`refresh-token:${userId}`);
  });
});
