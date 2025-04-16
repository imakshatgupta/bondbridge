import apiClient, { formDataApiClient } from "@/apis/apiClient";
import { SearchResponse, ApiResponse, ChatRoomsResponse, FollowingsResponse } from "../apiTypes/response";
import { CreateGroupRequest, EditGroupRequest } from "../apiTypes/request";


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
        profilePic: user.profilePic || user.avatar,
        bio: user.bio || "",
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
    // Return the full response structure including the chatRoom object
    return {
      ...response.data,
      success: true
    };
  } else {
    throw new Error(response.data.message || "Failed to create group");
  }
};

export const editGroup = async (
  data: EditGroupRequest
): Promise<ApiResponse> => {
  console.log("Editing group with data:", data);

  const formData = new FormData();
  formData.append("chatRoomId", data.groupId);
  formData.append("bio", data.bio);

  if (data.image) {
    formData.append("image", data.image);
  }

  if (data.groupName) {
    formData.append("groupName", data.groupName);
  }

  const response = await formDataApiClient.put<ApiResponse>("/edit-group", formData);

  console.log("Response from edit group:", response);

  if (response.status === 200 || response.status === 201) {
    return {
      ...response.data,
      success: true
    };
  } else {
    throw new Error(response.data.message || "Failed to edit group");
  }
};

export const blockUser = async (blockedUserId: string): Promise<ApiResponse> => {
  const response = await apiClient.post<ApiResponse>('/block-user',{
    blocked: blockedUserId
  });
  return response.data;
};

export const unblockUser = async (blockedUserId: string): Promise<ApiResponse> => {
  if (!blockedUserId) {
    throw new Error('User ID is required');
  }

  console.log("unblockUser API called with ID:", blockedUserId);

  const response = await apiClient.post<ApiResponse>('/unblock-user', {
    blocked: blockedUserId
  });

  console.log("Unblock user API response:", response);

  if (response.status === 200) {
    return response.data;
  } else {
    throw new Error(response.data.message || 'Failed to unblock user');
  }
};

export interface BlockedUser {
  userId: string;
  profilePic: string;
  name: string;
}

export interface GetBlockedUsersResponse {
  message: string;
  blockedUsers: BlockedUser[];
}

export const getBlockedUsers = async (): Promise<GetBlockedUsersResponse> => {
  const response = await apiClient.get<GetBlockedUsersResponse>('/get-blocked-users');

  console.log("Get blocked users API response:", response);

  if (response.status === 200) {
    return response.data;
  } else {
    throw new Error(response.data.message || 'Failed to fetch blocked users');
  }
};

export const leaveGroup = async (groupId: string): Promise<ApiResponse> => {
  const response = await apiClient.post<ApiResponse>('/leave-chatroom', {
    chatRoomId: groupId
  });
  
  if (response.status === 200) {
    return {
      ...response.data,
      success: true
    };
  } else {
    throw new Error(response.data.message || "Failed to leave group");
  }
};

export const inviteToGroup = async (groupId: string, userIds: string[]): Promise<ApiResponse> => {
  const response = await apiClient.put<ApiResponse>('/add-participants', {
    chatRoomId: groupId,
    participants: userIds
  });
  
  if (response.status === 200) {
    return {
      ...response.data,
      success: true
    };
  } else {
    throw new Error(response.data.message || "Failed to invite users to group");
  }
};

export const deleteGroup = async (chatId: string): Promise<ApiResponse> => {
  const response = await apiClient.delete<ApiResponse>('/delete-group', {
    data: { chatId }
  });
  
  if (response.status === 200) {
    return {
      ...response.data,
      success: true
    };
  } else {
    throw new Error(response.data.message || "Failed to delete group");
  }
};
