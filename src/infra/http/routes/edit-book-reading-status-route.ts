import type { FastifyInstance } from "fastify";
import { editBookReadingStatusController } from "../controllers/edit-book-reading-status-controler";
import {
  editBookReadingStatusBodySchema,
  editBookReadingStatusSuccessResponseSchema,
  editBookReadingStatusErrorResponseSchema,
} from "../schemas/edit-book-reading-status-schema";
import { isAuth } from "../middlewares/isAuth";
export function editBookReadingStatusRoute(app: FastifyInstance) {
  app.put(
    "/edit-book-reading-status",
    {
      preHandler: isAuth,
      config: {
        rateLimit: {
          max: 30,
          timeWindow: 1000 * 60,
        },
      },
      schema: {
        summary:
          "edit a book reading status and current page in the user's bookshelf",
        tags: ["Bookshelf"],
        security: [{ bearerAuth: [] }],
        body: editBookReadingStatusBodySchema,
        response: {
          200: editBookReadingStatusSuccessResponseSchema,
          409: editBookReadingStatusErrorResponseSchema,
        },
      },
    },
    editBookReadingStatusController,
  );
}
