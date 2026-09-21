import type { TokensRepository } from "../tokens-repository";

import { redis } from "../../../infra/lib/redis";

// infra/repositories/redis/redis-tokens-repository.ts
export class RedisTokensRepository implements TokensRepository {
  async saveRefreshToken(userId: string, token: string) {
    await redis.set(`refresh-token:${userId}`, token, {
      EX: 60 * 30, // 30 minutos em segundos
    });
  }

  async getRefreshToken(userId: string) {
    return redis.get(`refresh-token:${userId}`);
  }

  async deleteRefreshToken(userId: string) {
    await redis.del(`refresh-token:${userId}`);
  }
}
