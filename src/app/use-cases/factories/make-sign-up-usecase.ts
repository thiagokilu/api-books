import { DrizzleUsersRepository } from "../../repositories/drizzle/drizzle-users-repository";
import { signUpUseCase } from "../sign-up-usecase";

export function makeSignUpUseCase() {
  const usersRepository = new DrizzleUsersRepository();
  return (data: Parameters<typeof signUpUseCase>[0]) =>
    signUpUseCase(data, usersRepository);
}
