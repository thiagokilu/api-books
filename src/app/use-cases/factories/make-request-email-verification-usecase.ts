import { DrizzleUsersRepository } from "../../repositories/drizzle/drizzle-users-repository";
import { requestEmailVerification } from "../request-email-verification-usecase";

export function makeRequestEmailVerificationUsecase() {
  const usersRepository = new DrizzleUsersRepository();
  return (data: Parameters<typeof requestEmailVerification>[0]) =>
    requestEmailVerification(data, usersRepository);
}
