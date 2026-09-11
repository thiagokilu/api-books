// use-cases/sign-up-usecase.ts
import bcrypt from "bcrypt";
import "dotenv/config";
import { UserAlreadyExistsError } from "../erros/user-already-exist-error.js";
import type { UsersRepository } from "../repositories/users-repository.js";

export interface ISignUpUseCaseRequest {
  name: string;
  username: string;
  email: string;
  password: string;
  bio?: string | undefined;
}

export interface ISignUpUseCaseResponse {
  id: string;
  email: string;
}

export async function signUpUseCase(
  { email, name, username, password, bio }: ISignUpUseCaseRequest,
  usersRepository: UsersRepository,
): Promise<ISignUpUseCaseResponse> {
  if (!email || !name || !username || !password) {
    throw new Error("Missing required fields");
  }

  const existingUser = await usersRepository.findByEmailOrUsername(
    email,
    username,
  );

  if (existingUser) {
    throw new UserAlreadyExistsError();
  }

  const hashedPassword = await bcrypt.hash(
    password,
    process.env.SALT_ROUNDS ? parseInt(process.env.SALT_ROUNDS) : 10,
  );

  const user = await usersRepository.create({
    email,
    name,
    username,
    password: hashedPassword,
    bio: bio ?? null,
  });

  return {
    id: user.id,
    email: user.email,
  };
}
