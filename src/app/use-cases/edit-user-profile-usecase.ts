import type {
  CreateUserData,
  UsersRepository,
} from "../repositories/users-repository";

import { stripUndefined } from "../../infra/lib/stripUndefined";

export interface IEditUserProfileUseCaseRequest {
  id: string;
  name?: string;
  bio?: string;
}

export interface IEditUserProfileUseCaseResponse {
  name?: string;
  bio?: string;
  username: string;
  email: string;
}

export async function editUserProfileUseCase(
  { id, name, bio }: IEditUserProfileUseCaseRequest,
  usersRepository: UsersRepository,
): Promise<IEditUserProfileUseCaseResponse> {
  const user = await usersRepository.findById(id);

  if (!user) {
    throw new Error("User not found");
  }

  const data: Partial<CreateUserData> = {};

  if (name !== undefined) {
    data.name = name;
  }

  if (bio !== undefined) {
    data.bio = bio;
  }

  const editedUser = await usersRepository.editProfile(id, data);

  return {
    ...stripUndefined({
      name: editedUser.name,
      bio: editedUser.bio ?? undefined,
    }),
    username: editedUser.username,
    email: editedUser.email,
  };
}
