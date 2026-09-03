import type { FastifyRequest, FastifyReply } from "fastify";
import { makeGetUserProfileUseCase } from "../use-cases/factories/make-get-user-profile-usecase";

export async function getUserProfileController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const userid = request.userId;

    const getUserProfile = makeGetUserProfileUseCase();
    const user = await getUserProfile({ id: userid });

    return reply.status(200).send({ message: "User profile retrieved", user });
  } catch (error) {
    console.error("Error in getUserProfileController:", error);
    return reply.status(500).send({ error: "Internal server error" });
  }
}
