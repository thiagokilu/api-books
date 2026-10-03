import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryUsersRepository } from "../repositories/in-memory/in-memory-users-repository";
import { editUserProfileUseCase } from "./edit-user-profile-usecase";

let usersRepository: InMemoryUsersRepository;

describe("editUserProfileUseCase", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
  });

  it("should be able to edit the user's profile", async () => {
    const user = await usersRepository.create({
      name: "John Doe",
      username: "johndoe",
      email: "john.doe@example.com",
      password: "password123",
      bio: "Old bio",
    });

    const result = await editUserProfileUseCase(
      {
        id: user.id,
        name: "Jane Doe",
        bio: "New bio",
      },
      usersRepository,
    );

    expect(result).toEqual({
      name: "Jane Doe",
      bio: "New bio",
      username: "johndoe",
      email: "john.doe@example.com",
    });
  });

  it("should be able to edit the user's username", async () => {
    const user = await usersRepository.create({
      name: "John Doe",
      username: "johndoe",
      email: "john.doe@example.com",
      password: "password123",
    });

    const result = await editUserProfileUseCase(
      {
        id: user.id,
        username: "janedoe",
      },
      usersRepository,
    );

    expect(result.username).toBe("janedoe");
    expect((await usersRepository.findById(user.id))?.username).toBe("janedoe");
  });

  it("should not be able to edit a non-existent user's profile", async () => {
    await expect(
      editUserProfileUseCase(
        {
          id: "non-existent-user",
          name: "Jane Doe",
        },
        usersRepository,
      ),
    ).rejects.toThrow("User not found");
  });
});
