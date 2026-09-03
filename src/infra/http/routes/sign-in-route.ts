import type { FastifyInstance } from "fastify";
import { signInController } from "../infra/http/controlers/sign-in-controler";


export function signInRoute(app: FastifyInstance) {
  app.post("/sign-in", signInController);
}
