import apiClient from '@/apis/apiClient';
import { 
  FetchCommentsRequest, 
  PostCommentRequest 
} from '@/apis/apiTypes/request';
import { 
  FetchCommentsResponse, 
  PostCommentResponse 
} from '@/apis/apiTypes/response';

/**
 * Function to fetch comments for a specific post
 */
export const fetchComments = async (requestData: FetchCommentsRequest): Promise<FetchCommentsResponse> => {
  const { feedId } = requestData;
  
  if (!feedId) {
    throw new Error('Post ID is required');
  }
  
  const response = await apiClient.post<FetchCommentsResponse>(
    `/getCommentsForPostId`,
    { feedId }
  );
  
  if (response.status === 200 && response.data.success) {
    return response.data;
  } else {
    throw new Error(response.data.message || 'Failed to fetch comments');
  }
};

/**
 * Function to post a new comment on a post
 */
export const postComment = async (requestData: PostCommentRequest): Promise<PostCommentResponse> => {
  const { postId, comment } = requestData;
  
  if (!postId || !comment) {
    throw new Error('Post ID and comment content are required');
  }
  
  const response = await apiClient.post<PostCommentResponse>(
    `/comment`,
    { postId, comment }
  );
  
  if (response.status === 200 && response.data.success) {
    return response.data;
  } else {
    throw new Error(response.data.message || 'Failed to post comment');
  }
};

/**
 * Function to delete a comment
 */
export const deleteComment = async (commentId: string, postId: string): Promise<void> => {
  if (!postId) {
    throw new Error('Post ID is required');
  }

  if (!commentId) {
    throw new Error('Comment ID is required');
  }

  const response = await apiClient.delete('/comment', {
    data: { 
      commentId, 
      postId
    }
  });

  if (response.status !== 200 || !response.data.success) {
    throw new Error(response.data.message || 'Failed to delete comment');
  }
};