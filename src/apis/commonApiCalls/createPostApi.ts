import apiClient, { formDataApiClient } from '../apiClient';
import { CreatePostRequest } from '../apiTypes/request';
import { CreatePostResponse, RewriteWithBondChatResponse } from '../apiTypes/response';

/**
 * Creates a new post with optional media attachments
 * @param postData - The post data including content and media files
 * @returns Promise with the created post data
 */
export const createPost = async (postData: CreatePostRequest): Promise<CreatePostResponse> => {
  const formData = new FormData();
  
  // Append text data
  formData.append('content', postData.content);
  formData.append('whoCanComment', postData.whoCanComment.toString());
  formData.append('privacy', postData.privacy.toString());
  
  // Append image files if any
  if (postData.image && postData.image.length > 0) {
    postData.image.forEach((file) => {
      formData.append('image', file);
    });
  }
  
  // Append document files if any (if the API supports this)
  if (postData.document && postData.document.length > 0) {
    postData.document.forEach((file) => {
      formData.append('document', file);
    });
  }
  
  // For debugging
  console.log('Sending post data:', Object.fromEntries(formData.entries()));
  
  const response = await formDataApiClient.post<CreatePostResponse>('/post', formData);
  return response.data;
};

export const rewriteWithBondChat = async (caption : string)=>{
  const response = await apiClient.post<RewriteWithBondChatResponse>('/rewriteWithBond', { caption });
  const data = response.data;
  data.rewritten = data.rewritten.replace(/^[^\w\s]+|[^\w\s]+$/g, '').trim();
  
  return data;
}
