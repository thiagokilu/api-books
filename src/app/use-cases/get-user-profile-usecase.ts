import type { UsersRepository } from "../repositories/users-repository";

export interface IGetUserProfileUseCaseRequest {
  id: string;
}

export interface IGetUserProfileUseCaseResponse {
  id: string;
  name: string;
  username: string;
  email: string;
  bio: string | null;
  profileImageUrl: string | null;
  emailVerified: boolean;
}

export async function getUserProfileUseCase(
  { id }: IGetUserProfileUseCaseRequest,
  usersRepository: UsersRepository,
): Promise<IGetUserProfileUseCaseResponse> {
  const existingUser = await usersRepository.findById(id);

  if (!existingUser) {
    throw new Error("User not found");
  }

  return {
    id: existingUser.id,
    name: existingUser.name,
    username: existingUser.username,
    email: existingUser.email,
    bio: existingUser.bio ?? null,
    profileImageUrl: existingUser.profileImageUrl ?? null,
    emailVerified: existingUser.emailVerified,
  };
}
