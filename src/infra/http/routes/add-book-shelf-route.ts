import type { FastifyInstance } from "fastify";
import { addBookShelfController } from "../controllers/add-book-shelf-controler";
import {
  addBookShelfSchema,
  addBookShelfSuccessResponseSchema,
  addBookShelfErrorResponseSchema,
} from "../schemas/add-book-shelf-schema";
import { isAuth } from "../middlewares/isAuth";
export function addBookShelfRoute(app: FastifyInstance) {
  app.post(
    "/add-book-shelf",
    {
      preHandler: isAuth,
      config: {
        rateLimit: {
          max: 30,
          timeWindow: 1000 * 60,
        },
      },
      schema: {
        summary: "add a book to the user's bookshelf",
        tags: ["Bookshelf"],
        security: [{ bearerAuth: [] }],
        body: addBookShelfSchema,
        response: {
          201: addBookShelfSuccessResponseSchema,
          409: addBookShelfErrorResponseSchema,
        },
      },
    },
    addBookShelfController,
  );
}
