import type { FastifyReply, FastifyRequest } from "fastify";
import type { EditBookReadingStatusBodySchema } from "../schemas/edit-book-reading-status-schema";
import { makeEditBookReadingStatusUseCase } from "../../../app/use-cases/factories/make-editing-book-reading-status-usecase";

export async function editBookReadingStatusController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { cover_i, readingStatus } =
    request.body as EditBookReadingStatusBodySchema;

  try {
    const bookData = {
      userId: request.userId,
      cover_i,
      readingStatus,
    };

    const editBookReadingStatus = makeEditBookReadingStatusUseCase();
    await editBookReadingStatus(bookData);

    return reply
      .status(200)
      .send({ message: "Book reading status updated successfully" });
  } catch (error) {
    console.error("Error in editBookReadingStatusController:", error);
    return reply.status(500).send({ error: "Internal server error" });
  }
}
