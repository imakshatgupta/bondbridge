import { adminApiClient } from '@/apis/apiClient';
import { ApiResponse } from '@/apis/apiTypes/response';

export interface ReportRequest {
  postId: string;
  reporterId: string;
  description: string;
}

export const reportPost = async (data: ReportRequest): Promise<ApiResponse> => {
  const response = await adminApiClient.post<ApiResponse>('/reports', data);
  return response.data;
}; 