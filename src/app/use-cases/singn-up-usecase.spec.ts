import { describe, expect, it, beforeEach } from "vitest";
import { signUpUseCase } from "./sign-up-usecase";
import { InMemoryUsersRepository } from "../repositories/in-memory/in-memory-users-repository";
import { UserAlreadyExistsError } from "../erros/user-already-exist-error.js";

let usersRepository: InMemoryUsersRepository;

describe("SignUpUseCase", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
  });

  it("should be able to sign up", async () => {
    const user = await signUpUseCase(
      {
        name: "John Doe",
        username: "johndoe",
        email: "john.doe@example.com",
        password: "password123",
        bio: "I am John Doe",
      },
      usersRepository,
    );

    expect(user).toEqual({
      id: expect.any(String),
      email: "john.doe@example.com",
    });
  });

  it("should not be able to sign up with an existing email", async () => {
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

    await expect(
      signUpUseCase(
        {
          name: "Jane Doe",
          username: "janedoe2",
          email: "john.doe@example.com",
          password: "password123",
          bio: "I am Jane Doe",
        },
        usersRepository,
      ),
    ).rejects.toThrow(UserAlreadyExistsError);
  });

  it("should not be able to sign up with an existing username", async () => {
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

    await expect(
      signUpUseCase(
        {
          name: "Jane Doe",
          username: "johndoe",
          email: "jane.doe2@example.com",
          password: "password123",
          bio: "I am Jane Doe",
        },
        usersRepository,
      ),
    ).rejects.toThrow(UserAlreadyExistsError);
  });
});
