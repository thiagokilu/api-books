import type { FastifyRequest, FastifyReply } from "fastify";
import { makeRequestPasswordUseCase } from "../../../app/use-cases/factories/make-request-password-usecase";
import type { RequestPasswordBodySchema } from "../schemas/request-password-schema";

export async function requestPasswordController(
  request: FastifyRequest<{ Body: RequestPasswordBodySchema }>,
  reply: FastifyReply,
) {
  try {
    const { email } = request.body;

    const getRequestPassword = makeRequestPasswordUseCase();

    const { message } = await getRequestPassword({ email });
    return reply.status(200).send({ message });
  } catch (error) {
    console.error("Error in requestPasswordController:", error);
    return reply.status(500).send({ message: "Internal server error" });
  }
}
