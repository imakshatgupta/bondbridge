import apiClient, { formDataApiClient } from "@/apis/apiClient";
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
  return response.data;
};

export const fetchFollowRequests = async (
  params: FollowRequestsRequest
): Promise<FollowRequestsResponse> => {
  const response = await apiClient.get<FollowRequestsResponse>(
    "/followRequests",
    { params }
  );
  return response.data;
};

export const acceptFriendRequest = async (
  data: FriendRequestActionRequest
): Promise<ApiResponse> => {
  const formData = new FormData();
  formData.append("otherId", data.otherId);

  const response = await formDataApiClient.put<ApiResponse>(
    "/acceptRequest",
    formData
  );
  return response.data;
};

export const rejectFriendRequest = async (
  data: FriendRequestActionRequest
): Promise<ApiResponse> => {
  const formData = new FormData();
  formData.append("otherId", data.otherId);

  const response = await formDataApiClient.put<ApiResponse>(
    "/rejectRequest",
    formData
  );
  return response.data;
};
