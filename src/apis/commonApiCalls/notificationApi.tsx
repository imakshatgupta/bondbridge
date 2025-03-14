import apiClient from '@/apis/apiClient';
import { NotificationType, FriendRequestType } from '@/types/notification';

interface FetchNotificationsResponse {
  success: boolean;
  message?: string;
  notifications?: NotificationType[];
  friendRequests?: FriendRequestType[];
}

/**
 * Function to fetch all notifications and friend requests for the current user
 */
export const fetchNotifications = async (_nextPage: number): Promise<FetchNotificationsResponse> => {
  try {
    const response = await apiClient.get<FetchNotificationsResponse>(
      `/get-notifications`
    );
    
    if (response.status === 200 && response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch notifications');
    }
  } catch (error) {
    console.error("Error in fetchNotifications:", error);
    throw error;
  }
};

/**
 * Function to mark a notification as seen
 */
export const markNotificationAsSeen = async (notificationId: number): Promise<{success: boolean}> => {
  if (!notificationId) {
    throw new Error('Notification ID is required');
  }
  
  const response = await apiClient.put(
    `/mark-notification-seen`,
    { notificationId }
  );
  
  if (response.status === 200 && response.data.success) {
    return response.data;
  } else {
    throw new Error(response.data.message || 'Failed to mark notification as seen');
  }
};

/**
 * Function to accept or reject a friend request
 */
export const respondToFriendRequest = async (
  requestId: number, 
  accept: boolean
): Promise<{success: boolean}> => {
  if (!requestId) {
    throw new Error('Request ID is required');
  }
  
  const response = await apiClient.post(
    `/respond-friend-request`,
    { requestId, accept }
  );
  
  if (response.status === 200 && response.data.success) {
    return response.data;
  } else {
    throw new Error(response.data.message || 'Failed to respond to friend request');
  }
};