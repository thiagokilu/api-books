// repositories/drizzle/drizzle-users-repository.ts
import { db } from "../../../index";
import { usersTable, verificationTokensTable } from "../../../infra/db/schema";
import { eq, or, like } from "drizzle-orm";
import type {
  UsersRepository,
  CreateUserData,
  EditProfileData,
  User,
} from "../users-repository";
import type { VerificationToken } from "../users-repository";

export class DrizzleUsersRepository implements UsersRepository {
  async create(data: CreateUserData): Promise<User> {
    const result = await db
      .insert(usersTable)
      .values({
        email: data.email,
        name: data.name,
        username: data.username,
        password: data.password,
        bio: data.bio ?? null,
      })
      .returning();

    const user = result[0];

    if (!user) {
      throw new Error("Failed to create user");
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    return result[0] ?? null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const result = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, username))
      .limit(1);

    return result[0] ?? null;
  }

  async searchByUsername(username: string): Promise<User[]> {
    const result = await db
      .select()
      .from(usersTable)
      .where(like(usersTable.username, `%${username}%`));

    return result;
  }

  async findByEmailOrUsername(
    email: string,
    username: string,
  ): Promise<User | null> {
    const result = await db
      .select()
      .from(usersTable)
      .where(or(eq(usersTable.email, email), eq(usersTable.username, username)))
      .limit(1);

    return result[0] ?? null;
  }

  async findById(id: string): Promise<User | null> {
    const result = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);

    return result[0] ?? null;
  }

  async updatePassword(id: string, newHashedPassword: string): Promise<void> {
    await db
      .update(usersTable)
      .set({ password: newHashedPassword })
      .where(eq(usersTable.id, id));
  }

  async editProfile(id: string, data: EditProfileData): Promise<User> {
    const result = await db
      .update(usersTable)
      .set(data)
      .where(eq(usersTable.id, id))
      .returning();

    const user = result[0];

    if (!user) {
      throw new Error("Failed to edit user profile");
    }

    return user;
  }

  async saveVerificationToken(
    id: string,
    token: string,
    expiresAt: Date,
  ): Promise<void> {
    await db
      .insert(verificationTokensTable)
      .values({ id, token, expiresAt })
      .onConflictDoUpdate({
        target: [verificationTokensTable.id],
        set: { token, expiresAt },
      });
  }
  async markEmailAsVerified(id: string): Promise<void> {
    await db
      .update(usersTable)
      .set({ emailVerified: true })
      .where(eq(usersTable.id, id));
  }

  async findVerificationToken(
    token: string,
  ): Promise<VerificationToken | null> {
    const result = await db
      .select()
      .from(verificationTokensTable)
      .where(eq(verificationTokensTable.token, token))
      .limit(1);

    if (!result[0]) {
      return null;
    }

    return {
      id: result[0].id,
      token: result[0].token,
      expiresAt: result[0].expiresAt,
    };
  }

  async deleteVerificationToken(id: string): Promise<void> {
    await db
      .delete(verificationTokensTable)
      .where(eq(verificationTokensTable.id, id));
  }

  async deleteById(id: string): Promise<void> {
    await db.delete(usersTable).where(eq(usersTable.id, id));
  }
}
