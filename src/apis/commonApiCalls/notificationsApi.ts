import apiClient from "@/apis/apiClient";
import {
  NotificationsRequest,
  FollowRequestsRequest,
  FriendRequestActionRequest,
} from "../apiTypes/request";
import {
  NotificationsResponse,
  FollowRequestsResponse,
  Notification,
  FollowRequest,
  ApiResponse,
} from "../apiTypes/response";

export type { Notification, FollowRequest };

export const fetchNotifications = async (
  params?: NotificationsRequest
): Promise<NotificationsResponse> => {
  const response = await apiClient.get<NotificationsResponse>(
    "/get-notifications",
    { params }
  );

  if (response.status === 200) {
    return response.data;
  } else {
    throw new Error(response.data.message || "Failed to fetch notifications");
  }
};

export const fetchFollowRequests = async (
  params: FollowRequestsRequest
): Promise<FollowRequestsResponse> => {
  const response = await apiClient.get<FollowRequestsResponse>(
    "/followRequests",
    { params }
  );

  if (response.status === 200) {
    return response.data;
  } else {
    throw new Error(response.data.message || "Failed to fetch follow requests");
  }
};

export const acceptFriendRequest = async (
  data: FriendRequestActionRequest
): Promise<ApiResponse> => {
  const formData = new FormData();
  formData.append("otherId", data.otherId);

  const response = await apiClient.put<ApiResponse>(
    "/acceptRequest",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  if (response.status === 200) {
    return response.data;
  } else {
    throw new Error(response.data.message || "Failed to accept friend request");
  }
};

export const rejectFriendRequest = async (
  data: FriendRequestActionRequest
): Promise<ApiResponse> => {
  const formData = new FormData();
  formData.append("otherId", data.otherId);

  const response = await apiClient.put<ApiResponse>(
    "/rejectRequest",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  if (response.status === 200) {
    return response.data;
  } else {
    throw new Error(response.data.message || "Failed to reject friend request");
  }
};
