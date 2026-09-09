import type { FastifyRequest, FastifyReply } from "fastify";
import { refreshTokenUseCase } from "../../../app/use-cases/refresh-token-usecase";


export async function refreshTokenController(request: FastifyRequest, reply: FastifyReply) {
  try {
        console.log("Cookies:", request.cookies);
        console.log("RefreshToken:", request.cookies?.refreshToken);
    const { refreshToken } = request.cookies;

    const { accessToken } = await refreshTokenUseCase({ refreshToken });

    return reply.send({ accessToken });
  } catch {
    return reply.status(500).send("refresh token error");
  }
}
