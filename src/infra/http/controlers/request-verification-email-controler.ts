import type { FastifyRequest, FastifyReply } from "fastify";
import { makeRequestEmailVerificationUsecase } from "../../../app/use-cases/factories/make-request-email-verification-usecase";

export async function requestVerificationEmailController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const userId = request.userId;

    const requestEmailVerification = makeRequestEmailVerificationUsecase();
    const { message } = await requestEmailVerification(userId);

    return reply.status(200).send({ message });
  } catch (error) {
    console.error("Error in requestVerificationEmailController:", error);
    return reply.status(500).send({ message: "Internal server error" });
  }
}
