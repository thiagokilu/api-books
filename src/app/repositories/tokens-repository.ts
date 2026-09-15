// app/repositories/tokens-repository.ts
export interface TokensRepository {
  saveRefreshToken(userId: string, token: string): Promise<void>;
  getRefreshToken(userId: string): Promise<string | null>;
  deleteRefreshToken(userId: string): Promise<void>;
}
