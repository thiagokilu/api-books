// repositories/drizzle/drizzle-users-repository.ts
import { db } from "../../index";
import { usersTable } from "../../infra/db/schema.js";
import { eq, or } from "drizzle-orm";
import type { UsersRepository, CreateUserData, User } from "../users-repository";

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

  async findByEmailOrUsername(email: string, username: string): Promise<User | null> {
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
}
