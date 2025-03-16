import apiClient from '@/apis/apiClient';
import { ReactionRequest } from '@/apis/apiTypes/request';
import { ReactionResponse, GetAllReactionsResponse } from '@/apis/apiTypes/response';

export const addReaction = async (data: ReactionRequest): Promise<ReactionResponse> => {
  try {
    const response = await apiClient.post<ReactionResponse>('/reaction', data);
    return response.data;
  } catch (error) {
    console.error('Error adding reaction:', error);
    throw error;
  }
};

export const deleteReaction = async (data: ReactionRequest): Promise<ReactionResponse> => {
  try {
    const response = await apiClient.delete<ReactionResponse>('/reaction', { data });
    return response.data;
  } catch (error) {
    console.error('Error deleting reaction:', error);
    throw error;
  }
};

export const getAllReactions = async (entityId: string, entityType: string): Promise<GetAllReactionsResponse> => {
  try {
    const response = await apiClient.post<GetAllReactionsResponse>('/get-all-reactions', {
      entityId,
      entityType
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching reactions:', error);
    throw error;
  }
}; 