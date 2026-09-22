import type { FastifyReply, FastifyRequest } from "fastify";
import { makeVerifyEmailUsecase } from "../../../app/use-cases/factories/make-verify-email-usecase";
import type { VerifyEmailSchema } from "../schemas/verify-email-schema";

export async function verifyEmailController(
  request: FastifyRequest<{ Body: VerifyEmailSchema }>,
  reply: FastifyReply,
) {
  try {
    const { token } = request.body;
    const verifyEmail = makeVerifyEmailUsecase();
    const { message } = await verifyEmail(token);
    return reply.status(200).send({ message });
  } catch (error) {
    console.error("Error in verifyEmailController:", error);
    return reply.status(400).send({ message: "Invalid or expired token" });
  }
}
