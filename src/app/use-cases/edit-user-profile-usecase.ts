import type {
  EditProfileData,
  UsersRepository,
} from "../repositories/users-repository";

import { stripUndefined } from "../../infra/lib/stripUndefined";

export interface IEditUserProfileUseCaseRequest {
  id: string;
  name?: string;
  username?: string;
  bio?: string;
  profileImageUrl?: string;
}

export interface IEditUserProfileUseCaseResponse {
  name?: string;
  bio?: string;
  profileImageUrl?: string;
  username: string;
  email: string;
}

export async function editUserProfileUseCase(
  { id, name, username, bio, profileImageUrl }: IEditUserProfileUseCaseRequest,
  usersRepository: UsersRepository,
): Promise<IEditUserProfileUseCaseResponse> {
  const user = await usersRepository.findById(id);

  if (!user) {
    throw new Error("User not found");
  }

  const data: EditProfileData = {};

  if (name !== undefined) {
    data.name = name;
  }

  if (username !== undefined) {
    data.username = username;
  }

  if (bio !== undefined) {
    data.bio = bio;
  }

  if (profileImageUrl !== undefined) {
    data.profileImageUrl = profileImageUrl;
  }

  const editedUser = await usersRepository.editProfile(id, data);

  return {
    ...stripUndefined({
      name: editedUser.name,
      bio: editedUser.bio ?? undefined,
      profileImageUrl: editedUser.profileImageUrl ?? undefined,
    }),
    username: editedUser.username,
    email: editedUser.email,
  };
}
