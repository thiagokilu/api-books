import type { FastifyRequest, FastifyReply } from "fastify";

import { makeForgotPasswordUseCase } from "../../../app/use-cases/factories/make-forgot-password-usecase";

import type { ForgotPasswordBodySchema } from "../schemas/forgot-password-schema";

export async function forgotPasswordController(
  request: FastifyRequest<{ Body: ForgotPasswordBodySchema }>,
  reply: FastifyReply,
) {
  try {
    const { token, newPassword } = request.body;

    const forgotPassword = makeForgotPasswordUseCase();

    await forgotPassword({
      token,
      newPassword,
    });

    return reply.status(200).send({
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Error in forgotPasswordController:", error);

    return reply.status(400).send({
      message: "Internal server error",
    });
  }
}
