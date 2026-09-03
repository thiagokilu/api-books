import type { UsersRepository } from "../repositories/users-repository";

export interface IGetUserProfileUseCaseRequest {
  id: string;
}

export interface IGetUserProfileUseCaseResponse {
  username: string;
  email: string;
}

export async function getUserProfileUseCase({ id }: IGetUserProfileUseCaseRequest, usersRepository: UsersRepository): Promise<IGetUserProfileUseCaseResponse> {

  const existingUser = await usersRepository.findById(id);

  if (!existingUser) {
    throw new Error("User not found");
  }

  return {
    username: existingUser.username,
    email: existingUser.email,
  };
}
