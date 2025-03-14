import apiClient from "@/apis/apiClient";
import { SearchResponse, ApiResponse } from "../apiTypes/response";
import { CreateGroupRequest } from "../apiTypes/request";

interface FollowingUser {
  _id: string;
  name: string;
  avatar: string;
  bio?: string;
  email: string;
  interests: string[];
}

interface FollowingsResponse {
  result: FollowingUser[];
  message: string;
}

export const fetchFollowings = async (): Promise<SearchResponse> => {
  const response = await apiClient.get<FollowingsResponse>("/followings");

  // Transform the response to match SearchResponse format
  return {
    success: true,
    message: response.data.message,
    users: response.data.result.map((user) => ({
      id: user._id,
      name: user.name,
      avatar: user.avatar,
      bio: user.interests.join(", "), // Using interests as bio since it's required in Person type
    })),
  };
};

export const createGroup = async (
  data: CreateGroupRequest
): Promise<ApiResponse> => {
  console.log("data", data);
  const response = await apiClient.post<ApiResponse>("/create-group", data);
  return response.data;
};
