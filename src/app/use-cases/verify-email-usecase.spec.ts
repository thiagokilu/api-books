import { describe, expect, it, beforeEach } from "vitest";
import { InMemoryUsersRepository } from "../repositories/in-memory/in-memory-users-repository";
import { verifyEmail } from "./verify-email-usecase";

let usersRepository: InMemoryUsersRepository;

describe("VerifyEmailUseCase", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
  });

  it("should mark email as verified and delete the token", async () => {
    const user = await usersRepository.create({
      name: "John Doe",
      username: "johndoe",
      email: "john.doe@example.com",
      password: "hashedpassword",
    });

    await usersRepository.saveVerificationToken(
      user.id,
      "valid-token-123",
      new Date(Date.now() + 1000 * 60 * 60),
    );

    const response = await verifyEmail("valid-token-123", usersRepository);

    expect(response).toEqual({
      message: "Email verified successfully.",
    });

    const updatedUser = await usersRepository.findById(user.id);
    expect(updatedUser?.emailVerified).toBe(true);
    expect(await usersRepository.findVerificationToken("valid-token-123")).toBeNull();
  });

  it("should not verify email with a non-existing token", async () => {
    await expect(
      verifyEmail("non-existing-token", usersRepository),
    ).rejects.toThrow("Invalid or expired token");
  });

  it("should not verify email with an expired token", async () => {
    const user = await usersRepository.create({
      name: "John Doe",
      username: "johndoe",
      email: "john.doe@example.com",
      password: "hashedpassword",
    });

    await usersRepository.saveVerificationToken(
      user.id,
      "expired-token-123",
      new Date(Date.now() - 1000 * 60),
    );

    await expect(
      verifyEmail("expired-token-123", usersRepository),
    ).rejects.toThrow("Invalid or expired token");

    const updatedUser = await usersRepository.findById(user.id);
    expect(updatedUser?.emailVerified).toBe(false);
  });
});
