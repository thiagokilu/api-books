import type { FastifyRequest, FastifyReply } from "fastify";
import { makeShowBookShelfUseCase } from "../../../app/use-cases/factories/make-show-book-shelf-usecase";
import { showBookShelfSchema } from "../schemas/show-book-shelf-shcema";

export async function showBookShelfController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { userId } = request.params as { userId: string };

  // Validate the userId using the schema
  const validationResult = showBookShelfSchema.safeParse({ userId });
  if (!validationResult.success) {
    return reply.status(400).send({
      error: "Invalid user ID format",
    });
  }

  try {
    const showBookShelf = makeShowBookShelfUseCase();
    const books = await showBookShelf(userId);

    return reply.status(200).send(books);
  } catch (error) {
    console.error("Error in showBookShelfController:", error);
    return reply.status(500).send({ error: "Internal server error" });
  }
}
