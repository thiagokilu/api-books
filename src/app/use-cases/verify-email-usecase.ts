import type { UsersRepository } from "../repositories/users-repository";

export async function verifyEmail(
  token: string,
  usersRepository: UsersRepository,
) {
  const existingToken = await usersRepository.findVerificationToken(token);

  if (!existingToken || existingToken.expiresAt < new Date()) {
    throw new Error("Invalid or expired token");
  }

  await usersRepository.markEmailAsVerified(existingToken.id);
  await usersRepository.deleteVerificationToken(existingToken.id);

  return { message: "Email verified successfully." };
}
