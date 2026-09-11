import type { FastifyRequest, FastifyReply } from "fastify";
import { refreshTokenUseCase } from "../../../app/use-cases/refresh-token-usecase";

export async function refreshTokenController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  //pega o novo refresh token quando atualiza o access token, e atualiza o cookie com o novo refresh token

  try {
    const { refreshToken } = request.cookies;

    if (!refreshToken) {
      return reply.status(401).send({ message: "Refresh token is required" });
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await refreshTokenUseCase({ refreshToken });

    // 2. Atualizar o cookie no navegador com o novo token:
    reply.setCookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return reply.send({ accessToken });
  } catch {
    return reply.status(401).send({ message: "Refresh token error" });
  }
}
