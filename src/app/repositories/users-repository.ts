// repositories/users-repository.ts
export interface CreateUserData {
  name: string;
  username: string;
  email: string;
  password: string;
  bio?: string | null;
}

export type EditProfileData = Partial<Pick<CreateUserData, "name" | "bio">>;

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  password: string;
  bio?: string | null;
  emailVerified: boolean;
}

export interface VerificationToken {
  id: string;
  token: string;
  expiresAt: Date;
}

export interface UsersRepository {
  create(data: CreateUserData): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  searchByUsername(username: string): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByEmailOrUsername(email: string, username: string): Promise<User | null>;
  updatePassword(id: string, newHashedPassword: string): Promise<void>;
  editProfile(id: string, data: EditProfileData): Promise<User>;
  saveVerificationToken(
    id: string,
    token: string,
    expiresAt: Date,
  ): Promise<void>;
  markEmailAsVerified(id: string): Promise<void>;
  findVerificationToken(token: string): Promise<VerificationToken | null>;
  deleteVerificationToken(id: string): Promise<void>;
  deleteById(id: string): Promise<void>;
}
