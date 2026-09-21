import type { FastifyRequest, FastifyReply } from "fastify";
import { RedisTokensRepository } from "../../../app/repositories/redis/redis-token-repository";
import { LogoutUseCase } from "../../../app/use-cases/logout-usecase";

export async function logoutController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const userId = request.userId;
  const tokensRepository = new RedisTokensRepository();

  await LogoutUseCase({ userId }, tokensRepository);

  return reply
    .clearCookie("refreshToken")
    .clearCookie("accessToken")
    .status(200)
    .send({ message: "Logout realizado com sucesso" });
}
