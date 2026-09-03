import type { FastifyRequest, FastifyReply } from "fastify";
import { makeSignInUseCase } from "../use-cases/factories/make-sign-in-usecase";
import type { SignInBodySchema } from "../schemas/sign-in-schema";
import { InvalidCredentialsError } from "../app/erros/invalid-credentials-error";

export async function signInController(
  request: FastifyRequest<{ Body: SignInBodySchema }>,
  reply: FastifyReply,
) {
  try {
    const { email, password } = request.body;

    const signIn = makeSignInUseCase();

    const { token } = await signIn({
      email,
      password,
    });

    return reply.status(200).send({ message: "User logged in successfully", token });
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      return reply.status(400).send({ error: error.message });
    }

    console.error("Error in signInController:", error);
    return reply.status(500).send({ error: "Internal server error" });
  }
}
