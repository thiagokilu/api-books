import type { FastifyInstance } from "fastify";

import { signInController } from "../controllers/sign-in-controler";

import {
  signInSchema,
  signInSuccessResponseSchema,
  signInErrorResponseSchema,
} from "../schemas/sign-in-schema";

export function signInRoute(app: FastifyInstance) {
  app.post(
    "/sign-in",
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: 1000 * 60, // 1 minuto
        },
      },

      schema: {
        body: signInSchema,
        summary: "Sign in with email and password",
        tags: ["Auth"],
        response: {
          200: signInSuccessResponseSchema,
          400: signInErrorResponseSchema,
          500: signInErrorResponseSchema,
        },
      },
    },
    signInController,
  );
}
