import type { FastifyRequest, FastifyReply } from "fastify";
import type { AddBookShelfBodySchema } from "../schemas/add-book-shelf-schema";
import { makeAddBookToShelfUseCase } from "../../../app/use-cases/factories/make-add-book-shelf-usecase";

export async function addBookShelfController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const {
    id,
    title,
    subtitle,
    authors,
    coverUrl,
    description,
    publisher,
    language,
    publishedDate,
    publishedYear,
    categories,
    isbn,
    infoLink,
    pageCount,
  } = request.body as AddBookShelfBodySchema;

  // Call the use case to add the book to the user's bookshelf
  try {
    const bookData = {
      userId: request.userId,
      id,
      title,
      ...(subtitle ? { subtitle } : {}),
      authors,
      ...(coverUrl ? { coverUrl } : {}),
      ...(description ? { description } : {}),
      ...(publisher ? { publisher } : {}),
      ...(language ? { language } : {}),
      ...(publishedDate ? { publishedDate } : {}),
      ...(publishedYear !== undefined ? { publishedYear } : {}),
      ...(categories ? { categories } : {}),
      ...(isbn ? { isbn } : {}),
      ...(infoLink ? { infoLink } : {}),
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
