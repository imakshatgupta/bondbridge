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

// Media types
export interface Media {
  url: string;
  type: string; // "image" | "video"
}

// Reaction types
export interface ReactionDetails {
  total: number;
  types: {
    like: number;
    love: number;
    haha: number;
    lulu: number;
  };
}

export interface Reaction {
  hasReacted: boolean;
  reactionType: string | null;
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

// Community Post types
export interface CommunityPostData {
  id: string;
  author: {
    name: string;
    profilePic: string;
  };
  content: string;
  createdAt: number;
  media: Media[];
  stats: {
    commentCount: number;
    hasReacted: boolean;
    reactionCount: number;
    reactionType: string | null;
  };
  reactionDetails: ReactionDetails;
  isCommunity: boolean;
  communityId: string;
}

// Define the structure for community post API response
export interface CommunityPostResponse {
  _id: string;
  author: string;
  whoCanComment: number;
  privacy: number;
  content_type: string | null;
  taggedUsers: string[] | null;
  privateTo: string[];
  hideFrom: string[];
  status: number;
  createdAt: number;
  data: {
    content: string;
    media: Media[] | null;
  };
  feedId: string | null;
  weekIndex: string | null;
  userId: string | null;
  ago_time: string;
  isCommunity: boolean;
  commentCount: number;
  reactionCount: number;
  reactionDetails: ReactionDetails;
  reaction: Reaction;
  name: string;
  profilePic: string;
}

// Interface for community posts API response
export interface CommunityPostsResponse {
  success: boolean;
  posts: CommunityPostResponse[];
  count: number;
}

// API Request Interfaces
export interface FetchCommunitiesRequest {
  page?: number;
  limit?: number;
}

export interface FetchCommunityPostsRequest {
  communityId: string;
  page?: number;
  limit?: number;
}

// API Response Interfaces
export interface CommunitiesResponse {
  success: boolean;
  message: string;
  communities: CommunityResponse[];
}

export interface CommunityDetailResponse {
  success: boolean;
  message?: string;
  community: CommunityResponse;
}

// Comment related types
export interface CommentRequest {
  feedId: string;
  comment: string;
}

export interface FetchCommentsRequest {
  feedId: string;
  page: number;
  limit: number;
}

// ReactionUser for detailed reaction info
export interface ReactionUser {
  userId: string;
  name: string;
  profilePic: string;
}

// TransformedCommunityPost type for consistent post data structure across components
export interface TransformedCommunityPost {
  id: string;
  author: {
    name: string;
    profilePic: string;
  };
  content: string;
  createdAt: number;
  media: Media[];
  stats: {
    commentCount: number;
    hasReacted: boolean;
    reactionCount: number;
    reactionType: string | null;
  };
  reactionDetails: ReactionDetails;
  isCommunity: boolean;
  communityId: string;
}

// Re-export ProfilePostData as CommunityPostDetail for semantic clarity
export type CommunityPostDetail = ProfilePostData;
