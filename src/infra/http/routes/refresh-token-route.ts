import type { FastifyInstance } from "fastify";
import { refreshTokenController } from "../controlers/refresh-token-controller";
import {
  refreshTokenSuccessResponseSchema,
  refreshTokenErrorResponseSchema,
} from "../schemas/refresh-token-schema";

export function refreshTokenRoute(app: FastifyInstance) {
  app.post(
    "/refresh-token",
    {
      schema: {
        tags: ["Auth"],
        summary: "Refresh access token using refresh token",
        response: {
          200: refreshTokenSuccessResponseSchema,
          500: refreshTokenErrorResponseSchema,
        },
      },
    },
    refreshTokenController,
  );
}
