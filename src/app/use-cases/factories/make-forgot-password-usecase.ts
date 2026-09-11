import { DrizzleUsersRepository } from "../../repositories/drizzle/drizzle-users-repository";
import { DrizzlePasswordResetTokensRepository } from "../../repositories/drizzle/drizzle-password-reset-tokens-repository";
import { forgotPasswordUseCase } from "../forgot-password-usecase";

export function makeForgotPasswordUseCase() {
  const usersRepository = new DrizzleUsersRepository();
  const passwordResetTokensRepository =
    new DrizzlePasswordResetTokensRepository();

  return (data: Parameters<typeof forgotPasswordUseCase>[0]) =>
    forgotPasswordUseCase(data, usersRepository, passwordResetTokensRepository);
}
