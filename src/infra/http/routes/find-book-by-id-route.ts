import type { FastifyInstance } from "fastify";
import { findBookByIdController } from "../controllers/find-book-by-id-controler";
import {
  findBookByIdSchema,
  findBookByIdSuccessResponseSchema,
  findBookByIdErrorResponseSchema,
} from "../schemas/find-book-by-id-schema";

export function findBookByIdRoute(app: FastifyInstance) {
  app.get(
    "/books/:id",
    {
      config: {
        rateLimit: {
          max: 60,
          timeWindow: 1000 * 60,
        },
      },
      schema: {
        params: findBookByIdSchema,
        summary: "Find book by id",
        tags: ["Books"],
        response: {
          200: findBookByIdSuccessResponseSchema,
          500: findBookByIdErrorResponseSchema,
        },
      },
    },
    findBookByIdController,
  );
}
