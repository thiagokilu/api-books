import type { FastifyRequest, FastifyReply } from "fastify";
import type { EditBookReadingPageSchema } from "../schemas/edit-book-current-page-schema";
import { makeEditBookReadingPageUseCase } from "../../../app/use-cases/factories/make-edit-book-current-page-usecase";

export async function editBookReadingPageController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { cover_i, currentPage } = request.body as EditBookReadingPageSchema;

  try {
    const editBookReadingPage = makeEditBookReadingPageUseCase();
    await editBookReadingPage({
      userId: request.userId,
      cover_i,
      currentPage,
    });

    return reply
      .status(200)
      .send({ message: "Current page updated successfully", currentPage });
  } catch (error) {
    console.error("Error in editBookReadingPageController:", error);
    return reply.status(500).send({ error: "Internal server error" });
  }
}
