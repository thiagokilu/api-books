import { DrizzleUsersRepository } from "../../repositories/drizzle/drizzle-users-repository";
import { searchUsersUseCase } from "../search-users-usecase";

export function makeSearchUsersUseCase() {
  const usersRepository = new DrizzleUsersRepository();

  return (data: Parameters<typeof searchUsersUseCase>[0]) =>
    searchUsersUseCase(data, usersRepository);
}
