import { db } from "../../../index";
import { passwordResetTokensTable } from "../../../infra/db/schema";
import { eq } from "drizzle-orm";
import type {
  PasswordResetTokensRepository,
  CreatePasswordResetTokenData,
  PasswordResetToken,
} from "../password-reset-tokens-repository";

export class DrizzlePasswordResetTokensRepository implements PasswordResetTokensRepository {
  async create(
    data: CreatePasswordResetTokenData,
  ): Promise<PasswordResetToken> {
    const result = await db
      .insert(passwordResetTokensTable)
      .values({
        userId: data.userId,
        token: data.token,
        expiresAt: data.expiresAt,
      })
      .returning();

    const resetToken = result[0];

    if (!resetToken) {
      throw new Error("Failed to create password reset token");
    }

    return resetToken;
  }

  async findByToken(token: string): Promise<PasswordResetToken | null> {
    const result = await db
      .select()
      .from(passwordResetTokensTable)
      .where(eq(passwordResetTokensTable.token, token))
      .limit(1);

    return result[0] ?? null;
  }

  async delete(id: string): Promise<void> {
    await db
      .delete(passwordResetTokensTable)
      .where(eq(passwordResetTokensTable.id, id));
  }
}
