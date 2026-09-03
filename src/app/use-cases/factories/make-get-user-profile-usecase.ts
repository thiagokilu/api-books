import { DrizzleUsersRepository } from "../../repositories/drizzle/drizzle-users-repository";
import { getUserProfileUseCase } from "../get-user-profile-usecase";

export function makeGetUserProfileUseCase() {
  const usersRepository = new DrizzleUsersRepository();
  return (data: Parameters<typeof getUserProfileUseCase>[0]) =>
    getUserProfileUseCase(data, usersRepository);
}
