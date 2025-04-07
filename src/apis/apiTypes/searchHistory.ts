export interface SearchHistoryUser {
  userId: string;
  profilePic: string;
  name: string;
}

export interface AddSearchResponse {
  _id: string;
  userId: string;
  searchedUsers: string[];
  updatedAt: string;
}

export interface RemoveSearchResponse {
  acknowledged: boolean;
  modifiedCount: number;
  upsertedId: null | string;
  upsertedCount: number;
  matchedCount: number;
}

export interface GetSearchHistoryResponse {
  success: boolean;
  message: string;
  data: SearchHistoryUser[];
}

export interface AddSearchHistoryResponse {
  success: boolean;
  message: string;
  data: AddSearchResponse;
}

export interface RemoveSearchHistoryResponse {
  success: boolean;
  message: string;
  data: RemoveSearchResponse;
}

export interface ClearSearchHistoryResponse {
  success: boolean;
  message: string;
  data: RemoveSearchResponse;
}
