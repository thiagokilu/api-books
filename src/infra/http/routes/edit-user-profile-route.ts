import type { FastifyInstance } from "fastify";
import { editUserProfileController } from "../controlers/edit-user-profile-controler";
import {
  editUserProfileSchema,
  editUserProfileSuccessResponseSchema,
  editUserProfileErrorResponseSchema,
} from "../schemas/edit-user-profile-schema";
import { isAuth } from "../middlewares/isAuth";

export function editUserProfileRoute(app: FastifyInstance) {
  app.post(
    "/edit",
    {
      preHandler: isAuth,
      config: {
        rateLimit: {
          max: 20,
          timeWindow: 1000 * 60,
        },
      },
      schema: {
        summary: "Edit user profile",
        tags: ["User"],
        security: [{ bearerAuth: [] }],
        body: editUserProfileSchema,
        response: {
          200: editUserProfileSuccessResponseSchema,
          409: editUserProfileErrorResponseSchema,
          500: editUserProfileErrorResponseSchema,
        },
      },
    },
    editUserProfileController,
  );
}
