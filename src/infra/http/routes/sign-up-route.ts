import type { FastifyInstance } from "fastify";
import { signUpController } from "../controllers/sign-up-controler";
import {
  signUpSchema,
  signUpSuccessResponseSchema,
  signUpErrorResponseSchema,
} from "../schemas/sign-up-schema";

export function signUpRoute(app: FastifyInstance) {
  app.post(
    "/sign-up",
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: 1000 * 60,
        },
      },
      schema: {
        summary: "create a user",
        tags: ["Auth"],
        body: signUpSchema,
        response: {
          201: signUpSuccessResponseSchema,
          409: signUpErrorResponseSchema,
          500: signUpErrorResponseSchema,
        },
      },
    },
    signUpController,
  );
}
