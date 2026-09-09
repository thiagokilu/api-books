import type { FastifyInstance } from "fastify";
import { refreshTokenController } from "../controlers/refresh-token-controller";
import {
  successRefreshTokenResponseSchema,
  errorRefreshTokenResponseSchema,
} from "../schemas/refresh-token-schema";

export function refreshTokenRoute(app: FastifyInstance) {
  app.post("/refresh-token", {
    schema: {
      tags: ["Auth"],
      response: {
        200: successRefreshTokenResponseSchema,
        401: errorRefreshTokenResponseSchema,
      },
    },
  },refreshTokenController);
}
