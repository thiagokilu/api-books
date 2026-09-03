import jwt from "jsonwebtoken";
import "dotenv/config";
import bcrypt from "bcrypt";
import { InvalidCredentialsError } from "../erros/invalid-credentials-error";
import type { UsersRepository } from "../repositories/users-repository";

export interface ISignInUseCaseRequest {
  email: string;
  password: string;
}

export interface ISignInUseCaseResponse {
  token: string;
}

export async function signInUseCase(
     { email, password }: ISignInUseCaseRequest,
     usersRepository: UsersRepository,
   ): Promise<ISignInUseCaseResponse> {
     const user = await usersRepository.findByEmail(email);

  if (!user) {
    throw new Error("User not found");
  }

  const isPasswordValid = bcrypt.compareSync(password, user.password);

  if (!isPasswordValid) {
    throw new InvalidCredentialsError();
  }

  const token = jwt.sign(
    {},
    process.env.JWT_SECRET!,
    {
      subject: user.id,
      expiresIn: "1h",
    }
  );

  return {
    token: token,
  };
}
