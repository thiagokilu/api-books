import type { FastifyInstance } from "fastify";
import { signUpController } from "../controlers/sign-up-controler";
import { signUpSchema, signUpSuccessResponseSchema, signUpErrorResponseSchema } from "../schemas/sign-up-schema";

export function signUpRoute(app: FastifyInstance) {
  app.post("/sign-up", {
    schema: {
      summary: "create a user",
      tags: ["Auth"],
      body: signUpSchema,
      response: {
        201: signUpSuccessResponseSchema,
        409: signUpErrorResponseSchema,
        500: signUpErrorResponseSchema,
      }
  } }, signUpController);
}
