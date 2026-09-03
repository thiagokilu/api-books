import type { FastifyInstance } from "fastify";
import { signUpController } from "../infra/http/controlers/sign-up-controler";

export function signUpRoute(app: FastifyInstance) {
  app.post("/sign-up", signUpController);
}
