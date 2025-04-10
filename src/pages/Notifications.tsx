import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import FriendRequest from "@/components/notifications/FriendRequest";
import Notification from "@/components/notifications/Notification";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FollowRequest,
  fetchNotifications,
  fetchFollowRequests,
  markNotificationAsSeen,
} from "@/apis/commonApiCalls/notificationsApi";
import { useApiCall } from "@/apis/globalCatchError";
import LogoLoader from "@/components/LogoLoader";
import { EmptyState } from "@/components/ui/empty-state";
import { Bell, UserPlus, AlertCircle, ArrowLeft } from "lucide-react";

// Define the actual notification structure from the API
interface ApiNotification {
  _id: string;
  type: string;
  sender: {
    id: string;
    name: string;
    profilePic: string;
  };
  receiverId: string;
  details: {
    notificationText: string;
    notificationImage: string;
    entityType: string;
    entityId: string;
    headerId: string;
    entity: {
      _id: string;
      feedId?: string;
      [key: string]: unknown;
    };
    content: string | null;
  };
  timestamp: string;
  seen: boolean;
}

// New interface to match the updated API response structure
interface UpdatedNotificationsResponse {
  success: boolean;
  message: string;
  data: {
    currentPage: number;
    hasMore: boolean;
    seen: ApiNotification[];
    unseen: ApiNotification[];
    totalCount: number;
    totalPages: number;
  };
}

const Notifications = () => {
  const [unseenNotifications, setUnseenNotifications] = useState<ApiNotification[]>([]);
  const [seenNotifications, setSeenNotifications] = useState<ApiNotification[]>([]);
  const [friendRequests, setFriendRequests] = useState<FollowRequest[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [executeNotificationsFetch, isLoadingNotifications] =
    useApiCall(fetchNotifications);
  const [executeFollowRequestsFetch, isLoadingFollowRequests] =
    useApiCall(fetchFollowRequests);
  const [executeMarkAsSeen] = useApiCall(markNotificationAsSeen);

  const isLoading = isLoadingNotifications || isLoadingFollowRequests;

  const handleMarkAsSeen = async (notificationId: string) => {
    const result = await executeMarkAsSeen(notificationId);
    
    if (result.success) {
      // Move the notification from unseen to seen
      const notificationToMove = unseenNotifications.find(n => n._id === notificationId);
      if (notificationToMove) {
        const updatedNotification = { ...notificationToMove, seen: true };
        setUnseenNotifications(prev => prev.filter(n => n._id !== notificationId));
        setSeenNotifications(prev => [updatedNotification, ...prev]);
      }
    }
  };

  const loadData = async () => {
    // Fetch notifications
    const notificationsResult = await executeNotificationsFetch();
    console.log("notificationsResult: ", notificationsResult);
    if (notificationsResult.success && notificationsResult.data?.success) {
      // Cast the response to our updated interface
      const response = notificationsResult.data as unknown as UpdatedNotificationsResponse;
      
      if (response.data) {
        setUnseenNotifications(Array.isArray(response.data.unseen) ? response.data.unseen : []);
        setSeenNotifications(Array.isArray(response.data.seen) ? response.data.seen : []);
      } else {
        setUnseenNotifications([]);
        setSeenNotifications([]);
      }
      setError(null);
    } else {
      setUnseenNotifications([]);
      setSeenNotifications([]);
      setError(notificationsResult.data?.message || "Failed to load notifications");
    }

    // Fetch follow requests with pagination
    const followRequestsResult = await executeFollowRequestsFetch({
      page: 1,
      limit: 10,
    });
    if (followRequestsResult.success && followRequestsResult.data) {
      setFriendRequests(followRequestsResult.data.result || []);
    } else {
      setFriendRequests([]);
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

  const handleRefresh = () => {
    loadData();
  };

  // Get total notifications count
  const totalNotificationsCount = unseenNotifications.length + seenNotifications.length;

  return (
    <div className="w-full">
      <div className="flex items-center mb-5 relative">
        <Link to="/" className="absolute left-0 flex items-center text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-4xl font-semibold w-full text-center">Notifications</h1>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[65vh]">
          <LogoLoader size="md" />
        </div>
      ) : error ? (
        <EmptyState
          icon={AlertCircle}
          title="Couldn't load notifications"
          description={error}
          actionLabel="Try Again"
          onAction={handleRefresh}
          className="my-8"
        />
      ) : (
        <Tabs defaultValue="notifications" className="">
          <TabsList className="grid grid-cols-2  ">
            <TabsTrigger value="notifications" className="cursor-pointer ">
              Notifications{" "}
              {unseenNotifications.length > 0 && `(${unseenNotifications.length})`}
            </TabsTrigger>
            <TabsTrigger value="friend-requests" className="cursor-pointer">
              Friend Requests{" "}
              {friendRequests.length > 0 && `(${friendRequests.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="mt-4 ">
            <div className="space-y-4 ">
              {totalNotificationsCount > 0 ? (
                [...unseenNotifications, ...seenNotifications.slice(0, 5)].map((notification) => (
                  <Notification
                    key={notification._id}
                    _id={notification._id}
                    title={(notification.details.notificationText || notification.details.content || "")}
                    profilePic={notification.sender.profilePic}
                    timestamp={notification.timestamp}
                    seen={notification.seen}
                    onMarkAsSeen={handleMarkAsSeen}
                    senderId={notification.sender.id}
                    entityDetails={{
                      entityType: notification.details.entityType,
                      entityId: notification.details.entityId,
                      entity: notification.details.entity
                    }}
                  />
                ))
              ) : (
                <EmptyState
                  icon={Bell}
                  title="No Notifications"
                  description="You don't have any notifications yet. We'll notify you when something happens."
                  className="my-8"
                />
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
                <EmptyState
                  icon={UserPlus}
                  title="No Friend Requests"
                  description="You don't have any friend requests at the moment."
                  className="my-8"
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Notifications;