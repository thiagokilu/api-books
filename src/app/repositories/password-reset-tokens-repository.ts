export interface PasswordResetToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface CreatePasswordResetTokenData {
  userId: string;
  token: string;
  expiresAt: Date;
}

export interface PasswordResetTokensRepository {
  create(data: CreatePasswordResetTokenData): Promise<PasswordResetToken>;
  findByToken(token: string): Promise<PasswordResetToken | null>;
  delete(id: string): Promise<void>;
}
