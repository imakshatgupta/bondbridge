import apiClient from '@/apis/apiClient';
import { ApiResponse } from '@/apis/apiTypes/response';

export interface ReportRequest {
  postId: string;
  reporterId: string;
  description: string;
}

export const reportPost = async (data: ReportRequest): Promise<ApiResponse> => {
  try {
    const response = await apiClient.post<ApiResponse>('/reports', data);
    return response.data;
  } catch (error) {
    console.error('Error reporting post:', error);
    throw error;
  }
}; 