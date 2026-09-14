import { DrizzleUsersRepository } from "../../repositories/drizzle/drizzle-users-repository";
import { editUserProfileUseCase } from "../edit-user-profile-usecase";

export function makeEditUserProfileUseCase() {
  const usersRepository = new DrizzleUsersRepository();
  return (data: Parameters<typeof editUserProfileUseCase>[0]) =>
    editUserProfileUseCase(data, usersRepository);
}
