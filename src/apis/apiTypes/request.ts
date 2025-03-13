// Base phone type used in multiple requests
export interface BasePhoneRequest {
  phoneNumber: string;
  countryCode: string;
}

// OTP request type
export type SendOTPRequest = BasePhoneRequest;

// OTP verification request type
export interface VerifyOTPRequest extends BasePhoneRequest {
  otp: string;
}

// Login request type
export interface LoginRequest extends BasePhoneRequest {
  password: string;
}

// Password reset request types (for future use)
export type RequestPasswordResetRequest = BasePhoneRequest;

export interface ResetPasswordRequest extends VerifyOTPRequest {
  newPassword: string;
}

// Profile related types
export interface Community {
  id: number;
  name: string;
  members: number;
  pfp: string;
}

export interface CreateProfileRequest {
  userId?: string;
  name: string;
  email: string;
  dateOfBirth: string;
  password: string;
  skillSelected: string[];
  image?: File;
  avatar?: string;
  communitiesSelected?: Community[];
}

export interface FetchAvatarsRequest {
  userId?: string;
}

export interface SetPasswordRequest {
  userId?: string;
  password: string;
  token?: string;
}

export interface SearchRequest {
  searchString: string;
}

export interface NotificationsRequest {
  page?: number;
  limit?: number;
}

export interface FollowRequestsRequest {
  page: number;
  limit: number;
}

export interface FriendRequestActionRequest {
  otherId: string;
}
