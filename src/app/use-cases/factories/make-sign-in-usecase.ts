import { DrizzleUsersRepository } from "../../repositories/drizzle/drizzle-users-repository";
import { signInUseCase } from "../sign-in-usecase";

export function makeSignInUseCase() {
  const usersRepository = new DrizzleUsersRepository();
  return (data: Parameters<typeof signInUseCase>[0]) =>
    signInUseCase(data, usersRepository);
}
