import { describe, expect, it, beforeEach } from "vitest";
import { signUpUseCase } from "./sign-up-usecase";
import { InMemoryUsersRepository } from "../repositories/in-memory/in-memory-users-repository";
import { getUserProfileUseCase } from "./get-user-profile-usecase";
import "dotenv/config";

let usersRepository: InMemoryUsersRepository;

describe("getUserProfileUseCase", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
  });

  it("should be able to get user profile", async () => {
    const createdUser = await signUpUseCase(
      {
        name: "John Doe",
        username: "johndoe",
        email: "john.doe@example.com",
        password: "password123",
        bio: "I am John Doe",
      },
      usersRepository,
    );

    const result = await getUserProfileUseCase(
      {
        id: createdUser.id,
      },
      usersRepository,
    );

    expect(result).toMatchObject({
      username: "johndoe",
      email: "john.doe@example.com",
    });
  });

  it("should not be able to get user profile with wrong id", async () => {
    await expect(
      getUserProfileUseCase(
        {
          id: "non-existing-id",
        },
        usersRepository,
      ),
    ).rejects.toThrow("User not found");
  });
});
