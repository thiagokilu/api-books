import type { UsersRepository } from "../repositories/users-repository";


export interface ISearchUsersUseCaseRequest {
  username: string;
}

export interface ISearchUsersUseCaseResponse {
  users: {
    id: string;
    username: string;
  }[];
}

export async function searchUsersUseCase({ username }: ISearchUsersUseCaseRequest, usersRepository: UsersRepository): Promise<ISearchUsersUseCaseResponse> {
  const users = await usersRepository.searchByUsername(username);

  return {
    users: users.map(user => ({
      id: user.id,
      username: user.username,
    })),
  };
}
