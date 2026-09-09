import type { FastifyInstance } from "fastify";
import { signInController } from "../controlers/sign-in-controler";
import {
  signInSchema,
  signInSuccessResponseSchema,
  signInErrorResponseSchema,
} from "../schemas/sign-in-schema";

export function signInRoute(app: FastifyInstance) {
  app.post(
    "/sign-in",
    {
      schema: {
        body: signInSchema,
        tags: ["Auth"],
        response: {
          200: signInSuccessResponseSchema,
          401: signInErrorResponseSchema,
        },
      },
    },
    signInController,
  );
}
