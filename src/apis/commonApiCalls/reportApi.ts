import axios from 'axios';
import { ApiResponse } from '@/apis/apiTypes/response';
import { GET_AUTH_HEADERS } from '@/lib/constants';

// Create a special API client for the report API with the new base URL
const reportApiClient = axios.create({
  baseURL: 'https://bondbridge-admin-panel.vercel.app/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth headers to the report API client
reportApiClient.interceptors.request.use(
  (config) => {
    const authHeaders = GET_AUTH_HEADERS();
    
    if (config.headers) {
      Object.assign(config.headers, authHeaders);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface ReportRequest {
  postId: string;
  reporterId: string;
  description: string;
}

export const reportPost = async (data: ReportRequest): Promise<ApiResponse> => {
  const response = await reportApiClient.post<ApiResponse>('/reports', data);
  return response.data;
}; 