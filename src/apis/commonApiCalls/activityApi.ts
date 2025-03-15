import apiClient from "@/apis/apiClient";
import { SearchResponse, ApiResponse, ChatRoomsResponse, FollowingsResponse } from "../apiTypes/response";
import { CreateGroupRequest } from "../apiTypes/request";


export const fetchChatRooms = async (): Promise<ChatRoomsResponse> => {

  const response = await apiClient.get<ChatRoomsResponse>(
    "/get-all-chat-rooms"
  );
  return response.data;
};

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

  console.log("response from create group: ", response);

  if (response.status === 200 || response.status === 201) {
    // Ensure the response has a success property
    return {
      ...response.data,
      success: true
    };
  } else {
    throw new Error(response.data.message || "Failed to create group");
  }
};
