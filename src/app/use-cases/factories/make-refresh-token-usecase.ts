import { RedisTokensRepository } from "../../repositories/redis/redis-token-repository";
import { refreshTokenUseCase } from "../refresh-token-usecase";

export function makeRefreshTokenUseCase() {
  const tokensRepository = new RedisTokensRepository();
  return (data: Parameters<typeof refreshTokenUseCase>[0]) =>
    refreshTokenUseCase({ ...data, tokensRepository });
}
