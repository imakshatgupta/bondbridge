import { ProfilePostData } from './response';

// Community Member Types
export interface MemberDetail {
  _id: string;
  name: string;
  profilePic: string;
  avatar: string;
}

export interface ExtendedMember extends MemberDetail {
  nickName?: string;
  email?: string;
  interests?: string[];
}

// Community Response Types
export interface CommunityResponse {
  _id: string;
  name: string;
  profilePicture?: string;
  backgroundImage?: string;
  description?: string;
  bio?: string;
  interest?: string;
  createdAt: string | number;
  memberCount: number;
  postCount?: number;
  posts?: string[];
  members?: string[];
  memberDetails?: MemberDetail[];
}

// Community Join Request
export interface CommunityJoinRequest {
  communityIds: string[] | string;
  userId: string;
  action: 'join' | 'remove';
}

// Re-export ProfilePostData as CommunityPostDetail for semantic clarity
export type CommunityPostDetail = ProfilePostData;

// API Responses
export interface FetchCommunitiesRequest {
  page?: number;
  limit?: number;
}

export interface CommunitiesResponse {
  success: boolean;
  message: string;
  communities: CommunityResponse[];
}
