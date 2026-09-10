import type { FastifyRequest, FastifyReply } from "fastify";
import { LogoutUseCase } from "../../../app/use-cases/logout-usecase";

export async function logoutController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const userId = request.userId;

  await LogoutUseCase({ userId });

  return reply
    .clearCookie("refreshToken")
    .status(200)
    .send({ message: "Logout realizado com sucesso" });
}
