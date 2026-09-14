import type { FastifyInstance } from "fastify";
import { requestVerificationEmailController } from "../controlers/request-verification-email-controler";
import {
  requestVerificationEmailSuccessResponseSchema,
  requestVerificationEmailErrorResponseSchema,
} from "../schemas/request-verification-email-schema";
import { isAuth } from "../middlewares/isAuth";

export function requestVerificationEmailRoute(app: FastifyInstance) {
  app.post(
    "/request-verification-email",
    {
      preHandler: isAuth,
      schema: {
        summary: "Request email verification",
        tags: ["Auth"],
        security: [{ bearerAuth: [] }],
        response: {
          200: requestVerificationEmailSuccessResponseSchema,
          500: requestVerificationEmailErrorResponseSchema,
        },
      },
    },
    requestVerificationEmailController,
  );
}
