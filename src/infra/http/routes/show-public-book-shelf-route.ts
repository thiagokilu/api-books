import type { FastifyInstance } from "fastify";
import { showPublicBookShelfController } from "../controlers/show-public-book-shelf-controller";
import {
  showPublicBookShelfNotFoundResponseSchema,
  showPublicBookShelfParamsSchema,
  showPublicBookShelfSuccessResponseSchema,
} from "../schemas/show-public-book-shelf-schema";

export function showPublicBookShelfRoute(app: FastifyInstance) {
  app.get(
    "/users/:username/reading",
    {
      config: {
        rateLimit: {
          max: 60,
          timeWindow: 1000 * 60,
        },
      },
      schema: {
        summary: "Show the books a user is currently reading",
        tags: ["Bookshelf"],
        params: showPublicBookShelfParamsSchema,
        response: {
          200: showPublicBookShelfSuccessResponseSchema,
          404: showPublicBookShelfNotFoundResponseSchema,
        },
      },
    },
    showPublicBookShelfController,
  );
}
