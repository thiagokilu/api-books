import type { FastifyInstance } from "fastify";
import { getUserProfileController } from "../infra/http/controlers/get-user-profile-controler";
import { isAuth } from "../infra/http/middlewares/isAuth";

export function getUserProfileRoute(app: FastifyInstance) {
  app.get("/me", { preHandler: isAuth }, getUserProfileController);
}
