import { describe, expect, it, beforeEach } from "vitest";
import bcrypt from "bcrypt";
import "dotenv/config";
import { InMemoryUsersRepository } from "../repositories/in-memory/in-memory-users-repository";
import { InMemoryPasswordResetTokensRepository } from "../repositories/in-memory/in-memory-password-reset-tokens-repository";
import { forgotPasswordUseCase } from "./forgot-password-usecase";

let usersRepository: InMemoryUsersRepository;
let passwordResetTokensRepository: InMemoryPasswordResetTokensRepository;

describe("ForgotPasswordUseCase", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    passwordResetTokensRepository = new InMemoryPasswordResetTokensRepository();
  });

  it("should be able to reset password with a valid token", async () => {
    const user = await usersRepository.create({
      name: "John Doe",
      username: "johndoe",
      email: "john.doe@example.com",
      password: await bcrypt.hash("oldpassword123", 10),
      bio: "Bio here",
    });

    const resetToken = await passwordResetTokensRepository.create({
      userId: user.id,
      token: "valid-token-123",
      expiresAt: new Date(Date.now() + 1000 * 60 * 30), // 30 minutos no futuro
    });

    const response = await forgotPasswordUseCase(
      {
        token: "valid-token-123",
        newPassword: "newpassword123",
      },
      usersRepository,
      passwordResetTokensRepository,
    );

    expect(response).toEqual({
      message: "Password reset successfully.",
    });

    const updatedUser = await usersRepository.findById(user.id);
    expect(updatedUser).toBeDefined();

    const isPasswordUpdated = await bcrypt.compare(
      "newpassword123",
      updatedUser!.password,
    );
    expect(isPasswordUpdated).toBe(true);

    const tokenAfterUse = await passwordResetTokensRepository.findByToken(
      resetToken.token,
    );
    expect(tokenAfterUse).toBeNull();
  });

  it("should not be able to reset password with a non-existing token", async () => {
    await expect(
      forgotPasswordUseCase(
        {
          token: "non-existing-token",
          newPassword: "newpassword123",
        },
        usersRepository,
        passwordResetTokensRepository,
      ),
    ).rejects.toThrow("Invalid or expired token");
  });

  it("should not be able to reset password with an expired token", async () => {
    const user = await usersRepository.create({
      name: "John Doe",
      username: "johndoe",
      email: "john.doe@example.com",
      password: await bcrypt.hash("oldpassword123", 10),
      bio: "Bio here",
    });

    await passwordResetTokensRepository.create({
      userId: user.id,
      token: "expired-token-123",
      expiresAt: new Date(Date.now() - 1000 * 60), // 1 minuto no passado
    });

    await expect(
      forgotPasswordUseCase(
        {
          token: "expired-token-123",
          newPassword: "newpassword123",
        },
        usersRepository,
        passwordResetTokensRepository,
      ),
    ).rejects.toThrow("Invalid or expired token");
  });
});
