import { randomUUID } from "crypto";
import type {
  PasswordResetTokensRepository,
  CreatePasswordResetTokenData,
  PasswordResetToken,
} from "../password-reset-tokens-repository";

export class InMemoryPasswordResetTokensRepository
  implements PasswordResetTokensRepository
{
  public items: PasswordResetToken[] = [];

  async create(
    data: CreatePasswordResetTokenData,
  ): Promise<PasswordResetToken> {
    const token: PasswordResetToken = {
      id: randomUUID(),
      userId: data.userId,
      token: data.token,
      expiresAt: data.expiresAt,
      createdAt: new Date(),
    };

    this.items.push(token);

    return token;
  }

  async findByToken(token: string): Promise<PasswordResetToken | null> {
    const resetToken = this.items.find((item) => item.token === token);
    return resetToken ?? null;
  }

  async delete(id: string): Promise<void> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index !== -1) {
      this.items.splice(index, 1);
    }
  }
}
