// repositories/in-memory/in-memory-users-repository.ts
import { randomUUID } from "crypto";
import type {
  UsersRepository,
  CreateUserData,
  EditProfileData,
  User,
} from "../users-repository";

export class InMemoryUsersRepository implements UsersRepository {
  public items: User[] = [];
  public verificationTokens = new Map<
    string,
    { token: string; expiresAt: Date }
  >();

  async create(data: CreateUserData) {
    const user: User = {
      id: randomUUID(),
      ...data,
      emailVerified: false,
    };
    this.items.push(user);
    return user;
  }

  clear(): Promise<void> {
    this.items = [];
    this.verificationTokens.clear();
    return Promise.resolve();
  }

  async findByEmail(email: string) {
    return this.items.find((user) => user.email === email) ?? null;
  }

  async findByUsername(username: string) {
    return this.items.find((user) => user.username === username) ?? null;
  }

  async findByEmailOrUsername(email: string, username: string) {
    return (
      this.items.find(
        (user) => user.email === email || user.username === username,
      ) ?? null
    );
  }

  async findById(id: string) {
    return this.items.find((user) => user.id === id) ?? null;
  }

  async updatePassword(id: string, newHashedPassword: string): Promise<void> {
    const user = this.items.find((item) => item.id === id);

    if (user) {
      user.password = newHashedPassword;
    }
  }

  async editProfile(id: string, data: EditProfileData): Promise<User> {
    const user = this.items.find((item) => item.id === id);

    if (!user) {
      throw new Error("User not found");
    }

    Object.assign(user, data);
    return user;
  }

  async saveVerificationToken(
    id: string,
    token: string,
    expiresAt: Date,
  ): Promise<void> {
    const user = this.items.find((item) => item.id === id);

    if (!user) {
      throw new Error("User not found");
    }

    this.verificationTokens.set(id, { token, expiresAt });
  }

  async markEmailAsVerified(id: string): Promise<void> {
    const user = this.items.find((item) => item.id === id);

    if (user) {
      user.emailVerified = true;
    }
  }

  async findVerificationToken(token: string) {
    for (const [userId, storedToken] of this.verificationTokens) {
      if (storedToken.token === token) {
        return {
          id: userId,
          token: storedToken.token,
          expiresAt: storedToken.expiresAt,
        };
      }
    }

    return null;
  }

  async deleteVerificationToken(id: string): Promise<void> {
    this.verificationTokens.delete(id);
  }
}
