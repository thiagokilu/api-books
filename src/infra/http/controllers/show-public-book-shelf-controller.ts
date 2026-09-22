import type { FastifyReply, FastifyRequest } from "fastify";
import {
  UserNotFoundError,
} from "../../../app/use-cases/show-public-book-shelf-usecase";
import { makeShowPublicBookShelfUseCase } from "../../../app/use-cases/factories/make-show-public-book-shelf";

export async function showPublicBookShelfController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { username } = request.params as { username: string };
    const showPublicBookShelf = makeShowPublicBookShelfUseCase();
    const shelf = await showPublicBookShelf(username);

    return reply.status(200).send(shelf);
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      return reply.status(404).send({ error: error.message });
    }

    console.error("Error in showPublicBookShelfController:", error);
    return reply.status(500).send({ error: "Internal server error" });
  }
}
