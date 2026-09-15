import { DrizzleUsersRepository } from "../../repositories/drizzle/drizzle-users-repository";
import { RedisTokensRepository } from "../../repositories/redis/redis-token-repository";
import { signInUseCase } from "../sign-in-usecase";

export function makeSignInUseCase() {
  const usersRepository = new DrizzleUsersRepository();
  const tokensRepository = new RedisTokensRepository();
  return (data: Parameters<typeof signInUseCase>[0]) =>
    signInUseCase(data, usersRepository, tokensRepository);
}
