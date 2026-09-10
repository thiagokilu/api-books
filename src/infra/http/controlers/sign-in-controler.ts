import type { FastifyRequest, FastifyReply } from "fastify";
import { makeSignInUseCase } from "../../../app/use-cases/factories/make-sign-in-usecase";
import type { SignInBodySchema } from "../schemas/sign-in-schema";
import { InvalidCredentialsError } from "../../../app/erros/invalid-credentials-error";

export async function signInController(
  request: FastifyRequest<{ Body: SignInBodySchema }>,
  reply: FastifyReply,
) {
  try {
    const { email, password } = request.body;

    const signIn = makeSignInUseCase();

    const { accessToken, refreshToken } = await signIn({
      email,
      password,
    });

    //acess toke e refresh tokne no cookie

    reply.setCookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/", // Mude de "/refresh-token" para "/"
      maxAge: 60 * 60 * 24 * 7,
    });

    reply.setCookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/", // Mude de "/refresh-token" para "/"
      maxAge: 60 * 60 * 24 * 7,
    });

    return reply.status(200).send({
      message: "User logged in successfully",
      accessToken,
    });
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      return reply.status(400).send({
        error: error.message,
      });
    }

    console.error("Error in signInController:", error);

    return reply.status(500).send({
      error: "Internal server error",
    });
  }
}
