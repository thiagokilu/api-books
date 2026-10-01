import type { FastifyRequest, FastifyReply } from "fastify";
import type { AddBookShelfBodySchema } from "../schemas/add-book-shelf-schema";
import { makeAddBookToShelfUseCase } from "../../../app/use-cases/factories/make-add-book-shelf-usecase";

export async function addBookShelfController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id, title, authors, coverUrl, pageCount } =
    request.body as AddBookShelfBodySchema;

  // Call the use case to add the book to the user's bookshelf
  try {
    const bookData = {
      userId: request.userId,
      id,
      title,
      authors,
      ...(coverUrl ? { coverUrl } : {}),
      ...(pageCount !== undefined ? { pageCount } : {}),
    };

    const addBookToShelf = makeAddBookToShelfUseCase();
    await addBookToShelf(bookData);

    return reply
      .status(201)
      .send({ message: "Book added to shelf successfully" });
  } catch (error) {
    console.error("Error in addBookShelfController:", error);
    return reply.status(500).send({ error: "Internal server error" });
  }
}
