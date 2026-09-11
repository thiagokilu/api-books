import type { FastifyInstance } from "fastify";
import { searchBooksController } from "../controlers/search-books-controler";
import {
  searchBooksSchema,
  searchBooksSuccessResponseSchema,
  searchBooksErrorResponseSchema,
} from "../schemas/search-books-schema";

export function searchBooksRoute(app: FastifyInstance) {
  app.get(
    "/books/search",
    {
      schema: {
        querystring: searchBooksSchema,
        summary: "Search books",
        tags: ["Books"],
        response: {
          200: searchBooksSuccessResponseSchema,
          500: searchBooksErrorResponseSchema,
        },
      },
    },
    searchBooksController,
  );
}
