import bcrypt from "bcrypt";
import "dotenv/config";

import type { UsersRepository } from "../repositories/users-repository.js";
import type { PasswordResetTokensRepository } from "../repositories/password-reset-tokens-repository.js";

export interface ResetPasswordUseCaseRequest {
  token: string;
  newPassword: string;
}

export async function forgotPasswordUseCase(
  { token, newPassword }: ResetPasswordUseCaseRequest,
  usersRepository: UsersRepository,
  passwordResetTokensRepository: PasswordResetTokensRepository,
) {
  const resetToken = await passwordResetTokensRepository.findByToken(token);

  if (!resetToken || resetToken.expiresAt < new Date()) {
    throw new Error("Invalid or expired token");
  }

  const hashedPassword = await bcrypt.hash(
    newPassword,
    process.env.SALT_ROUNDS ? parseInt(process.env.SALT_ROUNDS) : 10,
  );

  await usersRepository.updatePassword(resetToken.userId, hashedPassword);

  // Token só pode ser usado uma vez
  await passwordResetTokensRepository.delete(resetToken.id);

  return { message: "Password reset successfully." };
}
