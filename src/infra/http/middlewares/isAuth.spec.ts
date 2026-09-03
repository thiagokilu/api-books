import { describe, expect, it, beforeEach } from "vitest";
import { signUpUseCase } from "../../../app/use-cases/sign-up-usecase";
import { InMemoryUsersRepository } from "../../../app/repositories/in-memory/in-memory-users-repository";
import { signInUseCase } from "../../../app/use-cases/sign-in-usecase";
import { isAuth } from "./isAuth";
import type { FastifyRequest, FastifyReply } from "fastify";
import { UnauthorizedError } from "../../../app/erros/unauthorizedError-error";
import jwt from "jsonwebtoken";

let usersRepository: InMemoryUsersRepository;

function makeRequest(authHeader?: string): FastifyRequest {
  return {
    headers: {
      authorization: authHeader,
    },
  } as unknown as FastifyRequest;
}

const reply = {} as FastifyReply;


describe("isAuth", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
  });

  it("should be able to access protected route", async () => {
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

    const { token } = await signInUseCase(
      {
        email: "john.doe@example.com",
        password: "password123",
      },
      usersRepository,
    );

    const request = makeRequest(`Bearer ${token}`);

    await isAuth(request, reply);

    expect(request.userId).toBeDefined();
  });

  it("should not be able to access protected route without token", async () => {
    const request = makeRequest();

    await expect(isAuth(request, reply)).rejects.toThrow(UnauthorizedError);
  });

  it("should not be able to access protected route with invalid token", async () => {
    const request = makeRequest(`Bearer invalid-token`);

    await expect(isAuth(request, reply)).rejects.toThrow(UnauthorizedError);
  });

  it("should not be able to access protected route with expired token", async () => {
    const fakeToken = jwt.sign({}, "outro-secret", { subject: "user-1" });
    const request = makeRequest(`Bearer ${fakeToken}`);

    await expect(isAuth(request, reply)).rejects.toThrow(UnauthorizedError);
  });
});
