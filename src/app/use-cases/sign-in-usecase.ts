import jwt from "jsonwebtoken";
import "dotenv/config";
import bcrypt from "bcrypt";
import { InvalidCredentialsError } from "../erros/invalid-credentials-error";
import type { UsersRepository } from "../repositories/users-repository";
import {redis} from '../../infra/lib/redis'

export interface ISignInUseCaseRequest {
  email: string;
  password: string;
}

export interface ISignInUseCaseResponse {
  accessToken: string;
  refreshToken: string;
}

export async function signInUseCase(
  { email, password }: ISignInUseCaseRequest,
  usersRepository: UsersRepository,
): Promise<ISignInUseCaseResponse> {
  const user = await usersRepository.findByEmail(email);

  if (!user) {
    throw new InvalidCredentialsError();
  }

  const isPasswordValid = bcrypt.compareSync(password, user.password);

  if (!isPasswordValid) {
    throw new InvalidCredentialsError();
  }

  // Token para acessar as rotas protegidas
  const accessToken = jwt.sign(
    {},
    process.env.JWT_SECRET!,
    {
      subject: user.id,
      expiresIn: "15m",
    }
  );

  // Token para renovar o access token
  const refreshToken = jwt.sign(
    {},
    process.env.JWT_REFRESH_SECRET!,
    {
      subject: user.id,
      expiresIn: "30m",
    }
  );

  // Salva o refresh token no Redis por 30 minutos
  await redis.set(
    `refresh-token:${user.id}`,
    refreshToken,
    {
      EX: 60 * 30, // 30 minutos
    },
  );

  return {
    accessToken,
    refreshToken,
  };
}
