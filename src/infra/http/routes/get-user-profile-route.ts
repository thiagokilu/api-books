import type { FastifyInstance } from "fastify";
import { getUserProfileController } from "../controlers/get-user-profile-controler";
import { isAuth } from "../middlewares/isAuth";
import { getUserProfileSuccessResponseSchema, getUserProfileErrorResponseSchema } from "../schemas/get-user-profile-schema";

export function getUserProfileRoute(app: FastifyInstance) {

    app.get("/me", {
      preHandler: isAuth,
      schema: {
        summary: "Profile data user",
        tags: ['User'],
        security: [{ bearerAuth: [] }],
        response: {
          200: getUserProfileSuccessResponseSchema,
          404: getUserProfileErrorResponseSchema,
        }
      },
    }, getUserProfileController)
  }
