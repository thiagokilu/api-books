import bcrypt from "bcrypt";
import { createHash } from "crypto";
import "dotenv/config";

import type { UsersRepository } from "../repositories/users-repository.js";
import type { PasswordResetTokensRepository } from "../repositories/password-reset-tokens-repository.js";
import { env } from "../../infra/lib/env.js";

export interface ResetPasswordUseCaseRequest {
  token: string;
  newPassword: string;
}

export async function forgotPasswordUseCase(
  { token, newPassword }: ResetPasswordUseCaseRequest,
  usersRepository: UsersRepository,
  passwordResetTokensRepository: PasswordResetTokensRepository,
) {
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const resetToken = await passwordResetTokensRepository.findByToken(tokenHash);

  if (!resetToken || resetToken.expiresAt < new Date()) {
    throw new Error("Invalid or expired token");
  }

  const hashedPassword = await bcrypt.hash(newPassword, env.SALT_ROUNDS);

  await usersRepository.updatePassword(resetToken.userId, hashedPassword);

  // Token só pode ser usado uma vez
  await passwordResetTokensRepository.delete(resetToken.id);

  return { message: "Password reset successfully." };
}
