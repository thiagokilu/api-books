// repositories/in-memory/in-memory-users-repository.ts
import { randomUUID } from "crypto";
import type { UsersRepository, CreateUserData, User } from "../users-repository";

export class InMemoryUsersRepository implements UsersRepository {
  public items: User[] = [];

  async create(data: CreateUserData) {
    const user: User = { id: randomUUID(), ...data };
    this.items.push(user);
    return user;
  }

  clear(): Promise<void> {
      this.items = [];
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
}
