import type { FastifyInstance } from "fastify";
import { getUserProfileController } from "../controllers/get-user-profile-controler";
import { isAuth } from "../middlewares/isAuth";
import {
  getUserProfileSuccessResponseSchema,
  getUserProfileErrorResponseSchema,
} from "../schemas/get-user-profile-schema";

export function getUserProfileRoute(app: FastifyInstance) {
  app.get(
    "/me",
    {
      preHandler: isAuth,
      config: {
        rateLimit: {
          max: 60,
          timeWindow: 1000 * 60,
        },
      },
      schema: {
        summary: "Profile data user",
        tags: ["User"],
        security: [{ bearerAuth: [] }],
        response: {
          200: getUserProfileSuccessResponseSchema,
          500: getUserProfileErrorResponseSchema,
        },
      },
    },
    getUserProfileController,
  );
}
