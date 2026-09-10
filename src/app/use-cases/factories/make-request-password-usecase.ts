import { DrizzleUsersRepository } from "../../repositories/drizzle/drizzle-users-repository";
import { DrizzlePasswordResetTokensRepository } from "../../repositories/drizzle/drizzle-password-reset-tokens-repository";
import { requestPasswordUseCase } from "../request-password-usecase";

export function makeRequestPasswordUseCase() {
  const usersRepository = new DrizzleUsersRepository();
  const passwordResetTokensRepository =
    new DrizzlePasswordResetTokensRepository();

  return (data: Parameters<typeof requestPasswordUseCase>[0]) =>
    requestPasswordUseCase(
      data,
      usersRepository,
      passwordResetTokensRepository,
    );
}
