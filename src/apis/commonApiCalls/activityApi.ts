import apiClient from "@/apis/apiClient";
import { SearchResponse, ApiResponse } from "../apiTypes/response";
import { CreateGroupRequest } from "../apiTypes/request";

export const fetchChatRooms = async (): Promise<ChatRoomsResponse> => {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  
  const response = await apiClient.get<ChatRoomsResponse>("/get-all-chat-rooms", {
    headers: {
      token,
      userid: userId,
    },
  });
  return response.data;
};

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

  if (response.status === 200) {
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
  } else {
    throw new Error(response.data.message || "Failed to fetch followings");
  }
};

export const createGroup = async (
  data: CreateGroupRequest
): Promise<ApiResponse> => {
  console.log("data", data);
  const response = await apiClient.post<ApiResponse>("/create-group", data);

  if (response.status === 200) {
    return response.data;
  } else {
    throw new Error(response.data.message || "Failed to create group");
  }
};
