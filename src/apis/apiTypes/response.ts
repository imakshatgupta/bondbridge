// Base API response interface
export interface ApiResponse<T = void> {
  success: boolean;
  message: string;
  data?: T;
}

// OTP response interfaces
export type SendOTPResponse = ApiResponse<{
  message: string;
  expiresIn: number;
}>

export type VerifyOTPResponse = {
  verified: boolean;
  token: string;
  message: string;
  userDetails: {
    _id: string;
    phoneNumber: string;
    countryCode: string;
  }
}

// Login response interface
export type LoginResponse = {
  token: string;
  message: string;
  userDetails: {
    statusCode: number;
    _id: string;
    phoneNumber: string;
    countryCode: string;
    // Add other user fields as needed
  }
}

// Password reset responses (for future use)
export type RequestPasswordResetResponse = ApiResponse<{
  message: string;
  expiresIn: number;
}>

export type ResetPasswordResponse = ApiResponse<{
  message: string;
}>

export interface AvatarItem {
  url: string;
  type: string;
}

export interface AvatarUrls {
  male: AvatarItem[];
  female: AvatarItem[];
}

export type CreateProfileResponse = ApiResponse<{
  user: {
    statusCode: number;
    userId: string;
    _id:string;
    name: string;
    email: string;
    avatar: string;
    interests: string[];
  }
}>

export type FetchAvatarsResponse = {
  success: boolean;
  message?: string;
  URLS: {
    male: AvatarItem[];
    female: AvatarItem[];
  }
}

export interface CommentData {
  id: string;
  user: string;
  avatar: string;
  content: string;
  likes: number;
  timeAgo: string;
  hasReplies: boolean;
  replies?: CommentData[];
  userId?: string;
}

export interface PostData {
  user: string;
  avatar: string;
  caption: string;
  image: string;
  likes: number;
  comments: number;
  datePosted: string;
  postDate: string;
}

export interface FetchCommentsResponse {
  hasMoreComments: boolean;
  success: boolean;
  message?: string;
  comments: CommentData[];
  post?: PostData;
}

export interface PostCommentResponse {
  success: boolean;
  message?: string;
  newComment?: CommentData;
}

export interface StoryData {
  id: number | string;
  user: string;
  avatar: string;
  isLive: boolean;
}

export interface HomePostData {
  id: number | string;
  user: string;
  avatar: string;
  postDate: string;
  caption: string;
  image: string;
  likes: number;
  comments: number;
  datePosted: string;
}

export interface FetchPostsResponse {
  hasMore: boolean;
  success: boolean;
  message?: string;
  posts: HomePostData[];
}

export interface FetchStoriesResponse {
  success: boolean;
  message?: string;
  stories: StoryData[];
}

export interface FetchHomepageDataResponse {
  postsData: FetchPostsResponse;
  storiesData: FetchStoriesResponse;
}

export interface FriendRequest {
  id: number;
  userId: number;
  name: string;
  avatar: string;
  bio: string;
  createdAt: string;
}

export interface AcceptFriendRequestResponse {
  success: boolean;
  message?: string;
}

export interface RejectFriendRequestResponse {
  success: boolean;
  message?: string;
}

export interface FetchFriendRequestsResponse {
  success: boolean;
  message?: string;
  data: {
    requests: FriendRequest[];
    hasMore: boolean;
    totalCount: number;
  };
}

export interface SendFriendRequestResponse {
  success: boolean;
  message?: string;
}