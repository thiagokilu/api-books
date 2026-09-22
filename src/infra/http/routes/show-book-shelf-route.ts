import type { FastifyInstance } from "fastify";

import { showBookShelfController } from "../controllers/show-book-shelf-controler";
import {
  showBookShelfErrorResponseSchema,
  showBookShelfSuccessResponseSchema,
} from "../schemas/show-book-shelf-shcema";
import { isAuth } from "../middlewares/isAuth";
export function showBookShelfRoute(app: FastifyInstance) {
  app.get(
    "/show-book-shelf",
    {
      preHandler: isAuth,
      config: {
        rateLimit: {
          max: 60,
          timeWindow: 1000 * 60,
        },
      },
      schema: {
        summary: "Show a user's bookshelf",
        tags: ["Bookshelf"],
        response: {
          200: showBookShelfSuccessResponseSchema,
          400: showBookShelfErrorResponseSchema,
        },
      },
    }, 
    showBookShelfController,
  );
}
