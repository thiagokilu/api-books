// repositories/users-repository.ts
export interface CreateUserData {
  name: string;
  username: string;
  email: string;
  password: string;
  bio?: string | null;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  password: string;
  bio?: string | null;
}

export interface UsersRepository {
  create(data: CreateUserData): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findByEmailOrUsername(email: string, username: string): Promise<User | null>;
  updatePassword(id: string, newHashedPassword: string): Promise<void>;
}
