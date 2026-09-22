import type { FastifyInstance } from "fastify";
import { refreshTokenController } from "../controllers/refresh-token-controller";
import {
  refreshTokenSuccessResponseSchema,
  refreshTokenErrorResponseSchema,
} from "../schemas/refresh-token-schema";

export function refreshTokenRoute(app: FastifyInstance) {
  app.post(
    "/refresh-token",
    {
      config: {
        rateLimit: {
          max: 10,
          timeWindow: 1000 * 60,
        },
      },
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
