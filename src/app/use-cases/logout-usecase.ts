import { redis } from "../../infra/lib/redis";

export interface ILogoutUseCaseRequest {
  userId: string;
}

export async function LogoutUseCase({ userId }: ILogoutUseCaseRequest) {
  // Remove o refresh token do Redis, invalidando a sessão
  await redis.del(`refresh-token:${userId}`);
}
