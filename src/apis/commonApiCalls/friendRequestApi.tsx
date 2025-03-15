import apiClient from '@/apis/apiClient';
import { 
  AcceptFriendRequestRequest,
  RejectFriendRequestRequest,
  FetchFriendRequestsRequest,
  SendFriendRequestRequest
} from '@/apis/apiTypes/request';
import {
  AcceptFriendRequestResponse,
  RejectFriendRequestResponse,
  FetchFriendRequestsResponse,
  SendFriendRequestResponse
} from '@/apis/apiTypes/response';

/**
 * Function to accept a friend request
 */
export const acceptFriendRequest = async (requestData: AcceptFriendRequestRequest): Promise<AcceptFriendRequestResponse> => {
  const { otherId } = requestData;
  
  if (!otherId) {
    throw new Error('Other user ID is required');
  }
  
  const formData = new FormData();
  formData.append('otherid', otherId.toString());
  
  const response = await apiClient.post<AcceptFriendRequestResponse>(
    `/acceptRequest`,
    formData,
    {
      headers: {
        'Cache-Control': 'no-cache',
      }
    }
  );
  
  if (response.status === 200 && response.data.success) {
    return response.data;
  } else {
    throw new Error(response.data.message || 'Failed to accept friend request');
  }
};

/**
 * Function to reject/decline a friend request
 */
export const rejectFriendRequest = async (requestData: RejectFriendRequestRequest): Promise<RejectFriendRequestResponse> => {
  const { otherId } = requestData;
  
  if (!otherId) {
    throw new Error('Other user ID is required');
  }
  
  const formData = new FormData();
  formData.append('otherid', otherId.toString());
  
  const response = await apiClient.post<RejectFriendRequestResponse>(
    `/rejectRequest`,
    formData,
    {
      headers: {
        'Cache-Control': 'no-cache',
      }
    }
  );
  
  if (response.status === 200 && response.data.success) {
    return response.data;
  } else {
    throw new Error(response.data.message || 'Failed to reject friend request');
  }
};

/**
 * Function to fetch friend requests with pagination for infinite scroll
 */
export const fetchFriendRequests = async (requestData: FetchFriendRequestsRequest): Promise<FetchFriendRequestsResponse> => {
  const { page = 1, limit = 10 } = requestData;
  
  const response = await apiClient.get<FetchFriendRequestsResponse>(
    `/friendRequests`,
    { 
      params: { page, limit },
      headers: {
        'Cache-Control': 'no-cache',
      }
    }
  );
  
  if (response.status === 200 && response.data.success) {
    return response.data;
  } else {
    throw new Error(response.data.message || 'Failed to fetch friend requests');
  }
};

/**
 * Function to send a friend request
 */
export const sendFriendRequest = async (requestData: SendFriendRequestRequest): Promise<SendFriendRequestResponse> => {
  const { userId } = requestData;
  
  if (!userId) {
    throw new Error('User ID is required');
  }
  
  const formData = new FormData();
  formData.append('userId', userId.toString());
  
  const response = await apiClient.post<SendFriendRequestResponse>(
    `/sendRequest`,
    formData,
    {
      headers: {
        'Cache-Control': 'no-cache',
      }
    }
  );
  
  if (response.status === 200 && response.data.success) {
    return response.data;
  } else {
    throw new Error(response.data.message || 'Failed to send friend request');
  }
};