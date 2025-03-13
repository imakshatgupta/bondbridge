import mockUserData from "@/constants/users";
import mockPosts from "@/constants/posts";
import {
  FetchUserProfileResponse,
  UserPostsResponse,
} from "../apiTypes/profileTypes";

export const fetchUserProfile = async (
  userId: string,
  currentUserId: string
): Promise<FetchUserProfileResponse> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const user = mockUserData[userId as keyof typeof mockUserData] || {
    username: "Unknown User",
    email: "",
    bio: "User not found",
    followers: 0,
    following: 0,
    avatarSrc: "/profile/user.png",
  };

  const isCurrentUser = currentUserId === userId;

  return {
    success: true,
    data: {
      ...user,
      email: isCurrentUser ? user.email : "", // Only show email for current user
      isCurrentUser,
    },
  };
};

export const fetchUserPosts = async (
  userId: string
): Promise<UserPostsResponse> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Filter posts for the current user from mock data
  const userPosts = Object.values(mockPosts)
    .filter((post) => post.userId === userId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .map((post) => ({
      id: parseInt(post.id),
      imageSrc: post.imageUrl,
    }));

  return {
    posts: userPosts,
  };
};
