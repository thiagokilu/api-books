import jwt from "jsonwebtoken";
import { InvalidCredentialsError } from "../erros/invalid-credentials-error";
import type { TokensRepository } from "../repositories/tokens-repository";
import { env } from "../../infra/lib/env.js";

interface IRefreshTokenUseCaseRequest {
  refreshToken: string;
}

export interface IRefreshTokenUseCaseResponse {
  accessToken: string;
  refreshToken: string;
}

export async function refreshTokenUseCase({
  refreshToken,
  tokensRepository,
}: IRefreshTokenUseCaseRequest & {
  tokensRepository: TokensRepository;
}): Promise<IRefreshTokenUseCaseResponse> {
  try {
    const payload = jwt.verify(
      refreshToken,
      env.JWT_REFRESH_SECRET,
    ) as jwt.JwtPayload;

    const userId = payload.sub;

    if (!userId) {
      throw new InvalidCredentialsError();
    }

    // 2. Busca o refresh token armazenado no Redis
    const storedRefreshToken = await tokensRepository.getRefreshToken(userId);

    // 3. Verifica se existe e se é o mesmo token
    if (!storedRefreshToken || storedRefreshToken !== refreshToken) {
      throw new InvalidCredentialsError();
    }

    // Gerar novo access token
    const accessToken = jwt.sign({}, env.JWT_SECRET, {
      subject: userId,
      expiresIn: "30m",
    });

    // Rotação: gerar novo refresh token
    const newRefreshToken = jwt.sign({}, env.JWT_REFRESH_SECRET, {
      subject: userId,
      expiresIn: "30m",
    });

    // Atualizar no Redis
    await tokensRepository.saveRefreshToken(userId, newRefreshToken);

    return { accessToken, refreshToken: newRefreshToken };
  } catch {
    throw new InvalidCredentialsError();
  }
}
