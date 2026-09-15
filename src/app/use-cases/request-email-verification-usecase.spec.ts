import { describe, expect, it, beforeEach, vi } from "vitest";
import { InMemoryUsersRepository } from "../repositories/in-memory/in-memory-users-repository";
import { requestEmailVerification } from "./request-email-verification-usecase";

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

describe("RequestEmailVerificationUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usersRepository = new InMemoryUsersRepository();
    mockSend.mockResolvedValue({ error: null, data: { id: "email-id" } });
  });

  it("should send a verification email for an unverified user", async () => {
    const user = await usersRepository.create({
      name: "John Doe",
      username: "johndoe",
      email: "john.doe@example.com",
      password: "hashedpassword",
      bio: "User bio",
    });

    const response = await requestEmailVerification(user.id, usersRepository);

    expect(response).toEqual({
      message:
        "If an account exists for this email, you will receive verification instructions.",
    });

    expect(usersRepository.verificationTokens.size).toBe(1);
    const storedToken = usersRepository.verificationTokens.get(user.id);
    expect(storedToken).toBeDefined();
    expect(storedToken!.expiresAt.getTime()).toBeGreaterThan(Date.now());

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: [user.email],
        subject: "Verify your email",
      }),
    );
  });

  it("should return the generic message without sending email if user is not found", async () => {
    const response = await requestEmailVerification(
      "nonexisting-user-id",
      usersRepository,
    );

    expect(response).toEqual({
      message:
        "If an account exists for this email, you will receive verification instructions.",
    });
    expect(usersRepository.verificationTokens.size).toBe(0);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("should not send email if the user is already verified", async () => {
    const user = await usersRepository.create({
      name: "John Doe",
      username: "johndoe",
      email: "john.doe@example.com",
      password: "hashedpassword",
    });

    await usersRepository.markEmailAsVerified(user.id);

    const response = await requestEmailVerification(user.id, usersRepository);

    expect(response).toEqual({
      message:
        "If an account exists for this email, you will receive verification instructions.",
    });
    expect(usersRepository.verificationTokens.size).toBe(0);
    expect(mockSend).not.toHaveBeenCalled();
  });
});
