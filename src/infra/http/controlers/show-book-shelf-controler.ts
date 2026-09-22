import type { FastifyRequest, FastifyReply } from "fastify";
import { makeShowBookShelfUseCase } from "../../../app/use-cases/factories/make-show-book-shelf-usecase";

export async function showBookShelfController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const authenticatedUserId = request.userId;

  try {
    const showBookShelf = makeShowBookShelfUseCase();
    const books = await showBookShelf(authenticatedUserId);

    return reply.status(200).send(books);
  } catch (error) {
    console.error("Error in showBookShelfController:", error);
    return reply.status(500).send({ error: "Internal server error" });
  }
}