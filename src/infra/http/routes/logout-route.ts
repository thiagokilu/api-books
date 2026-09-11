import type { FastifyInstance } from "fastify";
import { logoutController } from "../controlers/logout-controler";
import {
  logoutSuccessResponseSchema,
  logoutErrorResponseSchema,
} from "../schemas/logout-schema";
import { isAuth } from "../middlewares/isAuth";

export function logoutRoute(app: FastifyInstance) {
  app.post(
    "/logout",
    {
      preHandler: isAuth,
      schema: {
        summary: "Sign out of the current session",
        tags: ["Auth"],
        security: [{ bearerAuth: [] }],
        response: {
          200: logoutSuccessResponseSchema,
          400: logoutErrorResponseSchema,
          500: logoutErrorResponseSchema,
        },
      },
    },
    logoutController,
  );
}
