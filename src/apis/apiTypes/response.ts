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
}>;

export type VerifyOTPResponse = {
  verified: boolean;
  token: string;
  message: string;
  userDetails: {
    _id: string;
    phoneNumber: string;
    countryCode: string;
  };
};

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
  };
};

// Password reset responses (for future use)
export type RequestPasswordResetResponse = ApiResponse<{
  message: string;
  expiresIn: number;
}>;

export type ResetPasswordResponse = ApiResponse<{
  message: string;
}>;

export type SetPasswordResponse = {
  success: boolean;
  message: string;
};

export interface AvatarItem {
  url: string;
  type: string;
}

export interface AvatarUrls {
  male: AvatarItem[];
  female: AvatarItem[];
}

export type CreateProfileResponse = {
  user: {
    statusCode: number;
    userId: string;
    _id: string;
    name: string;
    email: string;
    avatar: string;
    interests: string[];
  };
};

export type FetchAvatarsResponse = {
  success: boolean;
  message?: string;
  URLS: {
    male: AvatarItem[];
    female: AvatarItem[];
  };
};

export interface Person {
  id: string;
  name: string;
  bio: string;
  avatar: string;
}

export interface SearchResponse {
  success: boolean;
  message: string;
  users: Person[];
}

export interface Notification {
  id: number;
  title: string;
  description: string;
  avatar: string;
  timestamp: string;
  seen: boolean;
}

export interface FollowRequest {
  _id: string;
  mobileNumber: string;
  countryCode: string;
  nickName: string;
  statusCode: number;
  privacyLevel: number;
  avatar: string;
  email: string;
  entityType: string;
  interests: string[];
  name: string;
  profilePic: string;
}

export interface NotificationsResponse {
  success: boolean;
  message: string;
  notifications: Notification[];
}

export interface FollowRequestsResponse {
  success: boolean;
  message: string;
  result: FollowRequest[];
}
