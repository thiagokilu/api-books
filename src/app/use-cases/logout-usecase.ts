import type { TokensRepository } from "../repositories/tokens-repository";
export interface ILogoutUseCaseRequest {
  userId: string;
}

export async function LogoutUseCase(
  { userId }: ILogoutUseCaseRequest,
  tokensRepository: TokensRepository,
) {
  // Remove o refresh token do Redis, invalidando a sessão
  await tokensRepository.deleteRefreshToken(userId);
}
