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

  const response = await formDataApiClient.put<ApiResponse>(
    "/acceptRequest",
    formData
  );

  if (response.status === 200) {
    return response.data;
  } else {
    throw new Error(response.data.message || "Failed to fetch follow requests");
  }
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

  if (response.status === 200) {
    return response.data;
  } else {
    throw new Error(response.data.message || "Failed to fetch follow requests");
  }
};

export const markNotificationAsSeen = async (
  notificationId: string
): Promise<ApiResponse> => {
  const response = await apiClient.post<ApiResponse>(
    "/mark-as-seen",
    { notificationId }
  );

  if (response.status === 200) {
    return response.data;
  } else {
    throw new Error(response.data.message || "Failed to mark notification as seen");
  }
};

export const deleteNotification = async (
  notificationId: string
): Promise<ApiResponse> => {
  const response = await apiClient.delete<ApiResponse>(
    `/delete-notification?notificationId=${notificationId}`
  );

  if (response.status === 200) {
    return response.data;
  } else {
    throw new Error(response.data.message || "Failed to delete notification");
  }
};
