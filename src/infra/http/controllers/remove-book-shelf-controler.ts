import type { FastifyReply, FastifyRequest } from "fastify";
import { makeRemoveBookShelfUseCase } from "../../../app/use-cases/factories/make-remove-book-shelf-usecase";

export async function removeBookShelfController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { cover_i } = request.body as { cover_i: number };

  try {
    const removeBookFromShelf = makeRemoveBookShelfUseCase();
    await removeBookFromShelf({ userId: request.userId, cover_i });

    return reply
      .status(200)
      .send({ message: "Book removed from shelf successfully" });
  } catch (error) {
    console.error("Error in removeBookShelfController:", error);
    return reply.status(500).send({ error: "Internal server error" });
  }
}
