export interface UserProfileData {
  username: string;
  email: string;
  bio?: string;
  followers: number;
  following: number;
  avatarSrc: string;
  isCurrentUser?: boolean;
  privacyLevel?: number;
}

export interface UserPostsResponse {
  posts: Array<{
    id: number;
    imageSrc: string;
  }>;
}

export interface FetchUserProfileResponse {
  success: boolean;
  data: UserProfileData;
}

export interface UpdateProfileRequest {
  userId: string;
  username?: string;
  email?: string;
  bio?: string;
  avatarSrc?: string;
}
