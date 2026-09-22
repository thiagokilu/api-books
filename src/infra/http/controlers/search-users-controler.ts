import type { FastifyRequest, FastifyReply } from "fastify";
import { makeSearchUsersUseCase } from "../../../app/use-cases/factories/make-search-users-usecase";

interface SearchUsersParams {
  username: string;
}

export async function searchUsersController(
  request: FastifyRequest<{ Params: SearchUsersParams }>,
  reply: FastifyReply,
) {
  try {
    const searchUsers = makeSearchUsersUseCase();
    const { users } = await searchUsers({ username: request.params.username });

    return reply.status(200).send({ message: "Users searched", users });
  } catch (error) {
    console.error("Error in searchUsersController:", error);
    return reply.status(500).send({ message: "Internal server error" });
  }
}
