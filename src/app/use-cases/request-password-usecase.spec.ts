import { describe, expect, it, beforeEach, vi } from "vitest";
import { InMemoryUsersRepository } from "../repositories/in-memory/in-memory-users-repository";
import { InMemoryPasswordResetTokensRepository } from "../repositories/in-memory/in-memory-password-reset-tokens-repository";
import { requestPasswordUseCase } from "./request-password-usecase";

const mockSend = vi.fn();

vi.mock("resend", () => {
  return {
    Resend: class {
      emails = {
        send: mockSend,
      };
    },
  };
});

let usersRepository: InMemoryUsersRepository;
let passwordResetTokensRepository: InMemoryPasswordResetTokensRepository;

describe("RequestPasswordUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usersRepository = new InMemoryUsersRepository();
    passwordResetTokensRepository = new InMemoryPasswordResetTokensRepository();
    mockSend.mockResolvedValue({ error: null, data: { id: "email-id" } });
  });

  it("should be able to request a password reset for an existing user", async () => {
    const user = await usersRepository.create({
      name: "John Doe",
      username: "johndoe",
      email: "john.doe@example.com",
      password: "hashedpassword",
      bio: "User bio",
    });

    const response = await requestPasswordUseCase(
      { email: "john.doe@example.com" },
      usersRepository,
      passwordResetTokensRepository,
    );

    expect(response).toEqual({
      message:
        "If an account exists for this email, you will receive reset instructions.",
    });

    expect(passwordResetTokensRepository.items).toHaveLength(1);
    const createdToken = passwordResetTokensRepository.items[0];
    expect(createdToken).toBeDefined();
    expect(createdToken!.userId).toBe(user.id);
    expect(createdToken!.token).toBeDefined();
    expect(createdToken!.expiresAt.getTime()).toBeGreaterThan(Date.now());

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: [user.email],
        subject: "Redefinição de senha",
      }),
    );
  });

  it("should return the generic message without generating a token if user is not found", async () => {
    const response = await requestPasswordUseCase(
      { email: "nonexisting@example.com" },
      usersRepository,
      passwordResetTokensRepository,
    );

    expect(response).toEqual({
      message:
        "If an account exists for this email, you will receive reset instructions.",
    });

    expect(passwordResetTokensRepository.items).toHaveLength(0);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("should throw an error if email sending fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mockSend.mockResolvedValueOnce({
      error: new Error("SMTP service unavailable"),
    });

    await usersRepository.create({
      name: "John Doe",
      username: "johndoe",
      email: "john.doe@example.com",
      password: "hashedpassword",
      bio: "User bio",
    });

    await expect(
      requestPasswordUseCase(
        { email: "john.doe@example.com" },
        usersRepository,
        passwordResetTokensRepository,
      ),
    ).rejects.toThrow("Failed to send email");
  });
});
