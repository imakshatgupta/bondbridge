import { useEffect, useState } from "react";
import FriendRequest from "@/components/notifications/FriendRequest";
import Notification from "@/components/notifications/Notification";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Notification as NotificationType,
  FollowRequest,
  fetchNotifications,
  fetchFollowRequests,
} from "@/apis/commonApiCalls/notificationsApi";
import { useApiCall } from "@/apis/globalCatchError";

const Notifications = () => {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [friendRequests, setFriendRequests] = useState<FollowRequest[]>([]);

  const [executeNotificationsFetch, isLoadingNotifications] =
    useApiCall(fetchNotifications);
  const [executeFollowRequestsFetch, isLoadingFollowRequests] =
    useApiCall(fetchFollowRequests);

  const isLoading = isLoadingNotifications || isLoadingFollowRequests;

  const handleMarkAsSeen = (notificationId: number) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification.id === notificationId
          ? { ...notification, seen: true }
          : notification
      )
    );
  };

  const loadData = async () => {
    // Fetch notifications
    const notificationsResult = await executeNotificationsFetch();
    if (notificationsResult.success && notificationsResult.data?.success) {
      setNotifications(notificationsResult.data.notifications);
    }

    // Fetch follow requests with pagination
    const followRequestsResult = await executeFollowRequestsFetch({
      page: 1,
      limit: 10,
    });
    if (followRequestsResult.success && followRequestsResult.data) {
      setFriendRequests(followRequestsResult.data.result || []);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFriendRequestAction = async (
    requestId: string,
    success: boolean
  ) => {
    if (success) {
      // If the action was successful, keep the request removed
      setFriendRequests((prev) => prev.filter((req) => req._id !== requestId));
    } else {
      // If the action failed, add the request back
      const failedRequest = friendRequests.find((req) => req._id === requestId);
      if (failedRequest) {
        setFriendRequests((prev) => [...prev, failedRequest]);
      }
    }
  };

  return (
    <div className="w-full">
      <h1 className="text-4xl font-semibold mb-5">Notifications</h1>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <Tabs defaultValue="notifications" className="">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="notifications">
              Notifications{" "}
              {notifications.filter((n) => !n.seen).length > 0 &&
                `(${notifications.filter((n) => !n.seen).length})`}
            </TabsTrigger>
            <TabsTrigger value="friend-requests">
              Friend Requests{" "}
              {friendRequests.length > 0 && `(${friendRequests.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="mt-4">
            <div className="space-y-4">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <Notification
                    key={notification.id}
                    {...notification}
                    onMarkAsSeen={handleMarkAsSeen}
                  />
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">
                  No notifications to show
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="friend-requests" className="mt-4">
            <div className="space-y-4">
              {friendRequests.length > 0 ? (
                friendRequests.map((request) => (
                  <FriendRequest
                    key={request._id}
                    {...request}
                    onActionComplete={handleFriendRequestAction}
                  />
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">
                  No friend requests to show
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Notifications;
