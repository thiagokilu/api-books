import { DrizzleUsersRepository } from "../../repositories/drizzle/drizzle-users-repository";
import { verifyEmail } from "../verify-email-usecase";

export function makeVerifyEmailUsecase() {
  const usersRepository = new DrizzleUsersRepository();
  return (data: Parameters<typeof verifyEmail>[0]) =>
    verifyEmail(data, usersRepository);
}
