import type { FastifyRequest, FastifyReply } from "fastify";
import { signUpUseCase } from "../use-cases/sign-up-usecase";
import type { SignUpBodySchema } from "../schemas/sign-up-schema";

export async function signUpController(
  request: FastifyRequest<{ Body: SignUpBodySchema }>,
  reply: FastifyReply,
) {
  try {
    const { name, username, email, password, bio } = request.body;

    await signUpUseCase({
      name,
      username,
      email,
      password,
      ...(bio === undefined ? {} : { bio }),
    });
    return reply.status(201).send({ message: "User created successfully" });
  } catch (error) {
    console.error("Error in signUpController:", error);
    reply.status(500).send({ error: "Internal server error" });
  }
}
