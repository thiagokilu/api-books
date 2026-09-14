import type { FastifyRequest, FastifyReply } from "fastify";
import type { EditUserProfileBodySchema } from "../schemas/edit-user-profile-schema";
import { makeEditUserProfileUseCase } from "../../../app/use-cases/factories/make-edit-user-profile-usecase";
import { stripUndefined } from "../../lib/stripUndefined";

export async function editUserProfileController(
  request: FastifyRequest<{ Body: EditUserProfileBodySchema }>,
  reply: FastifyReply,
) {
  try {
    const { name, bio } = request.body;
    const editUserProfile = makeEditUserProfileUseCase();

    const updatedUser = await editUserProfile(
      stripUndefined({
        id: request.userId,
        name,
        bio,
      }),
    );

    return reply.status(200).send({
      message: "User profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error in editUserProfileController:", error);
    return reply.status(500).send({ error: "Internal server error" });
  }
}
