import { describe, expect, it, beforeEach } from "vitest";
import { signUpUseCase } from "./sign-up-usecase";
import { db } from "../index"; // ajusta o path pro seu arquivo de conexão do drizzle
import { usersTable } from "../db/schema.js"; // ajusta o path pro seu schema
import { eq, or } from "drizzle-orm";
import { UserAlreadyExistsError } from "../erros/user-already-exist-error.js";

beforeEach(async () => {
  await db
    .delete(usersTable)
    .where(or(eq(usersTable.email, "john.doe@example.com")));
});

describe("SignUpUseCase", () => {
  it("should be able to sign up", async () => {
    const user = await signUpUseCase({
      name: "John Doe",
      username: "johndoe",
      email: "john.doe@example.com",
      password: "password123",
      bio: "I am John Doe",
    });
    expect(user).toEqual({
      id: expect.any(String),
      email: "john.doe@example.com",
    });
  });

  it("should not be able to sign up with an existing email", async () => {
    await signUpUseCase({
      name: "John Doe",
      username: "johndoe",
      email: "john.doe@example.com",
      password: "password123",
      bio: "I am John Doe",
    });
    await expect(
      signUpUseCase({
        name: "Jane Doe",
        username: "janedoe2",
        email: "john.doe@example.com",
        password: "password123",
        bio: "I am Jane Doe",
      }),
    ).rejects.toThrow(UserAlreadyExistsError);
  });

  it("should not be able to sign up with an existing username", async () => {
    await signUpUseCase({
      name: "John Doe",
      username: "johndoe",
      email: "john.doe@example.com",
      password: "password123",
      bio: "I am John Doe",
    });
    await expect(
      signUpUseCase({
        name: "Jane Doe",
        username: "johndoe",
        email: "jane.doe2@example.com",
        password: "password123",
        bio: "I am Jane Doe",
      }),
    ).rejects.toThrow(UserAlreadyExistsError);
  });
});
