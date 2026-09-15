import { describe, expect, it, beforeEach } from "vitest";
import { signUpUseCase } from "./sign-up-usecase";
import { InMemoryUsersRepository } from "../repositories/in-memory/in-memory-users-repository";
import { signInUseCase } from "./sign-in-usecase";
import { verify } from "jsonwebtoken";
import "dotenv/config";
import { InvalidCredentialsError } from "../erros/invalid-credentials-error";

let usersRepository: InMemoryUsersRepository;

describe("SignInUseCase", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
  });

  it("should be able to sign in with valid credentials", async () => {
    await signUpUseCase(
      {
        name: "John Doe",
        username: "johndoe",
        email: "john.doe@example.com",
        password: "password123",
        bio: "I am John Doe",
      },
      usersRepository,
    );

    const result = await signInUseCase(
      {
        email: "john.doe@example.com",
        password: "password123",
      },
      usersRepository, // ✅ Passado aqui
    );

    expect(result).toEqual({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    });

    const payload = verify(result.accessToken, String(process.env.JWT_SECRET));
    expect(payload).toMatchObject({
      sub: expect.any(String),
    });
  });

  it("should throw an error with invalid credentials", async () => {
    await signUpUseCase(
      {
        name: "John Doe",
        username: "johndoe",
        email: "john.doe@example.com",
        password: "password123",
        bio: "I am John Doe",
      },
      usersRepository, // ✅ Passado aqui
    );

    await expect(
      signInUseCase(
        {
          email: "john.doe@example.com",
          password: "wrongpassword",
        },
        usersRepository, // ✅ Passado aqui
      ),
    ).rejects.toThrow(InvalidCredentialsError);
  });
});
