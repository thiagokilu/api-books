import type { FastifyRequest, FastifyReply } from "fastify";
import type { SignUpBodySchema } from "../schemas/sign-up-schema";
import { makeSignUpUseCase } from "../use-cases/factories/make-sign-up-usecase";
import { UserAlreadyExistsError } from "../app/erros/user-already-exist-error.js";

export async function signUpController(
  request: FastifyRequest<{ Body: SignUpBodySchema }>,
  reply: FastifyReply,
) {
  try {
    const { name, username, email, password, bio } = request.body;

    const signUp = makeSignUpUseCase();

    await signUp({
      name,
      username,
      email,
      password,
      ...(bio === undefined ? {} : { bio }),
    });

    return reply.status(201).send({ message: "User created successfully" });
  } catch (error) {
    if (error instanceof UserAlreadyExistsError) {
      return reply.status(409).send({ error: error.message });
    }

    console.error("Error in signUpController:", error);
    return reply.status(500).send({ error: "Internal server error" });
  }
}
