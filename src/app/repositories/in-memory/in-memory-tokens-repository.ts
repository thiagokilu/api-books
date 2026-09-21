import type { TokensRepository } from "../tokens-repository";

// app/repositories/in-memory/in-memory-tokens-repository.ts
export class InMemoryTokensRepository implements TokensRepository {
  private store = new Map<string, string>();

  async saveRefreshToken(userId: string, token: string) {
    this.store.set(userId, token);
  }
  async getRefreshToken(userId: string) {
    return this.store.get(userId) ?? null;
  }
  async deleteRefreshToken(userId: string) {
    this.store.delete(userId);
  }
}
