import type { FastifyInstance } from "fastify";

import { searchUsersController } from "../controlers/search-users-controler";
import {
  searchUsersErrorResponseSchema,
  searchUsersSucessResponseSchema,
} from "../schemas/search-users-schema";
import { isAuth } from "../middlewares/isAuth";
export function searchUsersRoute(app: FastifyInstance) {
  app.get(
    "/search-users/:username",
    {
      preHandler: isAuth,
      config: {
        rateLimit: {
          max: 60,
          timeWindow: 1000 * 60,
        },
      },
      schema: {
        summary: "Search users",
        tags: ["Users"],
        response: {
          200: searchUsersSucessResponseSchema,
          400: searchUsersErrorResponseSchema,
          500: searchUsersErrorResponseSchema,
        },
      },
    }, 
    searchUsersController,
  );
}
