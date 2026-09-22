import type { FastifyInstance } from "fastify";
import { forgotPasswordController } from "../controllers/forgot-password-controler";
import {
  forgotPasswordSuccessResponseSchema,
  forgotPasswordErrorResponseSchema,
} from "../schemas/forgot-password-schema";
import { forgotPasswordSchema } from "../schemas/forgot-password-schema";

export function forgotPasswordRoute(app: FastifyInstance) {
  app.post(
    "/forgot-password",
    {
      config: {
        rateLimit: {
          max: 3,
          timeWindow: 1000 * 60,
        },
      },
      schema: {
        body: forgotPasswordSchema,
        summary: "Forgot password",
        tags: ["Auth"],
        response: {
          200: forgotPasswordSuccessResponseSchema,
          500: forgotPasswordErrorResponseSchema,
        },
      },
    },
    forgotPasswordController,
  );
}
