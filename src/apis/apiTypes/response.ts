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
