import { RedisTokensRepository } from "../../repositories/redis/redis-token-repository";
import { LogoutUseCase } from "../logout-usecase";

export function makeLogoutUseCase() {
  const tokensRepository = new RedisTokensRepository();
  return (data: Parameters<typeof LogoutUseCase>[0]) =>
    LogoutUseCase(data, tokensRepository);
}
