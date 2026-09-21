import type { FastifyInstance } from "fastify";
import { editBookReadingPageController } from "../controlers/edit-book-current-page-controler";
import {
  editBookReadingPageSchema,
  editBookReadingPageSuccessResponseSchema,
  editBookReadingPageErrorResponseSchema,
} from "../schemas/edit-book-current-page-schema";
import { isAuth } from "../middlewares/isAuth";
export function editBookReadingPageRoute(app: FastifyInstance) {
  app.post(
    "/edit-book-reading-page",
    {
      preHandler: isAuth,
      config: {
        rateLimit: {
          max: 60,
          timeWindow: 1000 * 60,
        },
      },
      schema: {
        summary: "add a book to the user's bookshelf",
        tags: ["Bookshelf"],
        security: [{ bearerAuth: [] }],
        body: editBookReadingPageSchema,
        response: {
          201: editBookReadingPageSuccessResponseSchema,
          409: editBookReadingPageErrorResponseSchema,
        },
      },
    },
    editBookReadingPageController,
  );
}
