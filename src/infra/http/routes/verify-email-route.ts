import type { FastifyInstance } from "fastify";
import { verifyEmailController } from "../controlers/verify-email-controler";
import {
  verifyEmailSchema,
  verifyEmailSuccessResponseSchema,
  verifyEmailErrorResponseSchema,
} from "../schemas/verify-email-schema";

export function verifyEmailRoute(app: FastifyInstance) {
  app.post(
    "/verify-email",
    {
      schema: {
        summary: "Verify user email",
        tags: ["Auth"],
        body: verifyEmailSchema,
        response: {
          200: verifyEmailSuccessResponseSchema,
          400: verifyEmailErrorResponseSchema,
          500: verifyEmailErrorResponseSchema,
        },
      },
    },
    verifyEmailController,
  );
}
