import { adminApiClient } from '../apiClient';
import { 
  CommunitiesResponse, 
  CommunityResponse, 
  CommunityJoinRequest,
  CommunityPostResponse,
  CommunityPostsResponse,
  FetchCommunitiesRequest,
  FetchCommunityPostsRequest,
  TransformedCommunityPost
} from '../apiTypes/communitiesTypes';
import { PostDetailsData } from '../apiTypes/response';

/**
 * Helper function to transform a community post to a standardized format
 * @param post The raw community post from the API
 * @param communityId The community ID this post belongs to
 * @returns Transformed post with consistent structure for UI components
 */
export const transformCommunityPost = (
  post: CommunityPostResponse,
  communityId: string
): TransformedCommunityPost => {
  return {
    id: post._id,
    author: {
      name: post.name,
      profilePic: post.profilePic,
    },
    content: post.data.content,
    createdAt: post.createdAt,
    media: post.data.media || [],
    stats: {
      commentCount: post.commentCount || 0,
      hasReacted: post.reaction?.hasReacted || false,
      reactionCount: post.reactionCount || 0,
      reactionType: post.reaction?.reactionType || null,
    },
    reactionDetails: {
      total: post.reactionDetails.total || 0,
      types: post.reactionDetails.types || {
        like: 0,
        love: 0,
        haha: 0,
        lulu: 0
      }
    },
    isCommunity: post.isCommunity,
    communityId: communityId
  };
};

/**
 * Function to fetch all communities
 * @returns Promise with community response array
 */
export const fetchCommunities = async (params?: FetchCommunitiesRequest): Promise<CommunityResponse[]> => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) {
    queryParams.append('page', params.page.toString());
  }
  if (params?.limit) {
    queryParams.append('limit', params.limit.toString());
  }
  
  const url = `/communities${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await adminApiClient.get<CommunitiesResponse>(url);
  return response.data.communities;
};

/**
 * Function to fetch communities where the current user is a member
 * @returns Promise with community response array
 */
export const fetchUserCommunities = async (): Promise<CommunityResponse[]> => {
  const userId = localStorage.getItem('userId');
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  const communities = await fetchCommunities();
  
  // Filter communities where the user is a member
  return communities.filter(community => 
    community.members && community.members.includes(userId)
  );
};

/**
 * Function to join or leave a community or multiple communities
 * @param params Join community request params
 * @returns Promise with success and message
 */
export const joinCommunity = async (params: CommunityJoinRequest): Promise<{ success: boolean; message?: string }> => {
  const userId = localStorage.getItem('userId');

  if (!userId) {
    throw new Error('User not authenticated');
  }

  const response = await adminApiClient.post(
    '/users/joincommunity',
    {
      communityIds: params.communityIds,
      userId: userId,
      action: params.action
    }
  );
  
  return {
    success: response.status === 200,
    message: response.data.message
  };
};

/**
 * Function to join multiple communities at once
 * @param communityIds Array of community IDs to join
 * @returns Promise with success and message
 */
export const joinMultipleCommunities = async (communityIds: string[]): Promise<{ success: boolean; message?: string }> => {
  const userId = localStorage.getItem('userId');
  if(!userId) {
    throw new Error('User not authenticated');
  }
  return joinCommunity({
    communityIds: communityIds,
    userId,
    action: 'join'
  });
};

/**
 * Function to fetch a specific community by ID
 * @param communityId Community ID
 * @returns Promise with community response
 */
export const fetchCommunityById = async (communityId: string): Promise<CommunityResponse> => {
  const response = await adminApiClient.get<CommunityResponse>(
    `/communities/${communityId}`
  );
  
  return response.data;
};

/**
 * Function to fetch all posts of a community by community ID
 * @param communityId Community ID
 * @param params Optional parameters (page, limit)
 * @returns Promise with transformed community posts array
 */
export const fetchCommunityPosts = async (
  communityId: string, 
  params?: Omit<FetchCommunityPostsRequest, 'communityId'>
): Promise<TransformedCommunityPost[]> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    
    const url = `/communities/${communityId}/post${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await adminApiClient.get<CommunityPostsResponse>(url);
    
    if (!response.data.success) {
      console.warn('API reported failure to fetch community posts');
      return [];
    }
    
    // Transform posts to consistent format
    return (response.data.posts || []).map(post => transformCommunityPost(post, communityId));
  } catch (error) {
    console.error('Error fetching community posts:', error);
    return [];
  }
};

/**
 * Function to fetch details of a specific post by post ID
 * @param postId Post ID
 * @returns Promise with post details data
 */
export const fetchPostDetails = async (postId: string): Promise<PostDetailsData> => {
  const response = await adminApiClient.get<{ success: boolean; post: PostDetailsData }>(
    `/posts/${postId}`
  );
  
  if (!response.data.success) {
    throw new Error('Failed to fetch post details');
  }
  
  return response.data.post;
};

/**
 * Interface for like post request parameters
 */
interface LikePostRequest {
  postId: string;
  reactionType: 'like' | 'love' | 'haha' | 'lulu';
}

/**
 * Function to like/react to a community post
 * @param communityId Community ID
 * @param params Request parameters (postId and reactionType)
 * @returns Promise with like post response
 */
export const reactOnPost = async (
  communityId: string,
  params: LikePostRequest
): Promise<PostDetailsData> => {
  const url = `/communities/${communityId}/post/like`;
  const response = await adminApiClient.post<{ success: boolean; post: PostDetailsData }>(url, {
    postId: params.postId,
    reactionType: params.reactionType
  });
  
  if (!response.data.success) {
    throw new Error('Failed to react post');
  }
  return response.data.post;
};

/**
 * Interface for comment on post request parameters
 */
interface CommentOnPostRequest {
  postId: string;
  content: string;
}

/**
 * Function to comment on a community post
 * @param communityId Community ID
 * @param params Request parameters (postId and content)
 * @returns Promise with comment on post response
 */
export const commentOnPost = async (
  communityId: string,
  params: CommentOnPostRequest
): Promise<PostDetailsData> => {
  
  const url = `/communities/${communityId}/post/comment`;
  const response = await adminApiClient.post<{ success: boolean; post: PostDetailsData }>(url, {
    postId: params.postId,
    content: params.content
  });
  
  if (!response.data.success) {
    throw new Error('Failed to comment on post');
  }
  return response.data.post;
};

/**
 * Interface for delete comment request parameters
 */
interface DeleteCommentRequest {
  postId: string;
  commentId: string;
}

/**
 * Function to delete a comment on a community post
 * @param communityId Community ID
 * @param params Request parameters (postId and commentId)
 * @returns Promise with delete comment response
 */
export const deleteComment = async (
  communityId: string,
  params: DeleteCommentRequest
): Promise<{ success: boolean; message: string }> => {
  const url = `/communities/${communityId}/post/comment?postId=${params.postId}&commentId=${params.commentId}`;
  const response = await adminApiClient.delete<{ success: boolean; message: string }>(url);
  
  if (!response.data.success) {
    throw new Error('Failed to delete comment');
  }
  return response.data;
};