import type { FastifyRequest } from "fastify";
import { makeSearchBooksUseCase } from "../../../app/use-cases/factories/make-search-books-usecase";
import type { SearchBooksQuerySchema } from "../schemas/search-books-schema";

export async function searchBooksController(
  request: FastifyRequest<{ Querystring: SearchBooksQuerySchema }>,
) {
  const { query, page, limit } = request.query;
  const searchBooks = makeSearchBooksUseCase();

  const result = await searchBooks({
    query,
    page,
    limit,
  });

  return result;
}
