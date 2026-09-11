import type { FastifyRequest, FastifyReply } from "fastify";
import { makeSearchBooksUseCase } from "../../../app/use-cases/factories/make-search-books-usecase";
import type { SearchBooksQuerySchema } from "../schemas/search-books-schema";

export async function searchBooksController(
  request: FastifyRequest<{ Querystring: SearchBooksQuerySchema }>,
  reply: FastifyReply,
) {
  const { query } = request.query;
  const searchBooks = makeSearchBooksUseCase();

  const result = await searchBooks({
    query,
  });

  return result;
}
