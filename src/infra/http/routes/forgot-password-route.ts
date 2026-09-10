import type { FastifyInstance } from "fastify";
import { forgotPasswordController } from "../controlers/forgot-password-controler";
import {
  forgotPasswordSuccessResponseSchema,
  forgotPasswordErrorResponseSchema,
} from "../schemas/forgot-password-schema";
import { forgotPasswordSchema } from "../schemas/forgot-password-schema";

export function forgotPasswordRoute(app: FastifyInstance) {
  app.post(
    "/forgot-password",
    {
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
