import type { FastifyInstance } from "fastify";
import { requestPasswordController } from "../controlers/request-password-controler";
import {
  requestPasswordSuccessResponseSchema,
  requestPasswordErrorResponseSchema,
} from "../schemas/request-password-schema";
import { requestPasswordSchema } from "../schemas/request-password-schema";

export function requestPasswordRoute(app: FastifyInstance) {
  app.post(
    "/request-password",
    {
      schema: {
        body: requestPasswordSchema,
        summary: "Forgot password",
        tags: ["Auth"],
        response: {
          200: requestPasswordSuccessResponseSchema,
          500: requestPasswordErrorResponseSchema,
        },
      },
    },
    requestPasswordController,
  );
}
