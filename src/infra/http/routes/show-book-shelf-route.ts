import type { FastifyInstance } from "fastify";

import { showBookShelfController } from "../controlers/show-book-shelf-controler";
import {
  showBookShelfErrorResponseSchema,
  showBookShelfSchema,
  showBookShelfSuccessResponseSchema,
} from "../schemas/show-book-shelf-shcema";
export function showBookShelfRoute(app: FastifyInstance) {
  app.get(
    "/show-book-shelf/:userId",
    {
      config: {
        rateLimit: {
          max: 60,
          timeWindow: 1000 * 60,
        },
      },
      schema: {
        summary: "Show a user's bookshelf",
        tags: ["Bookshelf"],
        params: showBookShelfSchema,
        response: {
          200: showBookShelfSuccessResponseSchema,
          400: showBookShelfErrorResponseSchema,
        },
      },
    },
    showBookShelfController,
  );
}
