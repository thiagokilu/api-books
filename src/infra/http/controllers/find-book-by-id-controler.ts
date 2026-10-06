import type { FastifyRequest } from "fastify";
import { makeFindBookByIdUseCase } from "../../../app/use-cases/factories/make-find-book-by-id-usecase";

export async function findBookByIdController(
  request: FastifyRequest<{ Params: { id: string } }>,
) {
  const { id } = request.params;
  const findBookById = makeFindBookByIdUseCase();

  const { book } = await findBookById({ id });

  return { message: "Book found", book };
}
