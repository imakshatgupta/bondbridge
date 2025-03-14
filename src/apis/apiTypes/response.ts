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
  socketToken: string;
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

export type CreateProfileResponse = ApiResponse<{
  user: {
    statusCode: number;
    userId: string;
    _id: string;
    name: string;
    email: string;
    avatar: string;
    interests: string[];
  };
}>;

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

interface ChatParticipant {
  userId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  profilePic: string;
}

interface BaseChatRoom {
  _id: string;
  chatRoomId: string;
  participants: ChatParticipant[];
  roomType: "dm" | "group" | "community";
  createdAt: string;
  updatedAt: string;
  isPart: boolean;
  unseenCount: number;
  lastMessage?:
    | {
        text: string;
      }
    | string;
}

interface DMChatRoom extends BaseChatRoom {
  roomType: "dm";
}

interface GroupChatRoom extends BaseChatRoom {
  roomType: "group";
  groupName: string;
  profileUrl: string | null;
  admin: string;
}

interface CommunityChatRoom extends BaseChatRoom {
  roomType: "community";
  groupName: string;
  profileUrl: string | null;
  admin: string;
}

export type ChatRoom = DMChatRoom | GroupChatRoom | CommunityChatRoom;

export interface ChatRoomsResponse {
  message: string;
  chatRooms: ChatRoom[];
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

export interface ChatMessage {
  _id: string;
  content: string;
  senderId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetMessagesResponse {
  success: boolean;
  message: string;
  messages: ChatMessage[];
  totalPages: number;
  currentPage: number;
}
