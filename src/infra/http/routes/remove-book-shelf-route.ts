import type { FastifyInstance } from "fastify";
import { removeBookShelfController } from "../controlers/remove-book-shelf-controler";
import {
  removeBookShelfSchema,
  removeBookShelfSuccessResponseSchema,
  removeBookShelfErrorResponseSchema,
} from "../schemas/remove-book-shelf-schema";
import { isAuth } from "../middlewares/isAuth";
export function removeBookShelfRoute(app: FastifyInstance) {
  app.post(
    "/remove-book-shelf",
    {
      preHandler: isAuth,
      config: {
        rateLimit: {
          max: 30,
          timeWindow: 1000 * 60,
        },
      },
      schema: {
        summary: "remove a book from the user's bookshelf",
        tags: ["Bookshelf"],
        security: [{ bearerAuth: [] }],
        body: removeBookShelfSchema,
        response: {
          201: removeBookShelfSuccessResponseSchema,
          409: removeBookShelfErrorResponseSchema,
        },
      },
    },
    removeBookShelfController,
  );
}
