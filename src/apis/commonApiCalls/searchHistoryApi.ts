import apiClient from '@/apis/apiClient';
import {
  SearchHistoryUser,
  AddSearchHistoryResponse,
  RemoveSearchHistoryResponse,
  GetSearchHistoryResponse,
  ClearSearchHistoryResponse
} from '@/apis/apiTypes/searchHistory';

export const addToSearchHistory = async (userId: string): Promise<AddSearchHistoryResponse> => {
  const response = await apiClient.post<AddSearchHistoryResponse>('/add-recent-search', { searchedUserId: userId });
  return response.data;
};

export const removeFromSearchHistory = async (userId: string): Promise<RemoveSearchHistoryResponse> => {
  const response = await apiClient.post<RemoveSearchHistoryResponse>('/remove-recent-search', { searchedUserId: userId });
  return response.data;
};

export const getSearchHistory = async (): Promise<SearchHistoryUser[]> => {
  const response = await apiClient.get<GetSearchHistoryResponse>('/get-recent-searches');
  return response.data.data;
};

export const clearSearchHistory = async (): Promise<ClearSearchHistoryResponse> => {
  const response = await apiClient.delete<ClearSearchHistoryResponse>('/clear-recent-searches');
  return response.data;
};
