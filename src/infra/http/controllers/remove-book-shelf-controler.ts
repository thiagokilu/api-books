import type { FastifyReply, FastifyRequest } from "fastify";
import { makeRemoveBookShelfUseCase } from "../../../app/use-cases/factories/make-remove-book-shelf-usecase";

export async function removeBookShelfController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = request.body as { id: string };

  try {
    const removeBookFromShelf = makeRemoveBookShelfUseCase();
    await removeBookFromShelf({ userId: request.userId, id });

    return reply
      .status(200)
      .send({ message: "Book removed from shelf successfully" });
  } catch (error) {
    console.error("Error in removeBookShelfController:", error);
    return reply.status(500).send({ error: "Internal server error" });
  }
}
