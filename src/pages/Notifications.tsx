import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import FriendRequest from "@/components/notifications/FriendRequest";
import SentRequest from "@/components/notifications/SentRequest";
import Notification from "@/components/notifications/Notification";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FollowRequest,
  fetchNotifications,
  fetchFollowRequests,
  fetchSentRequests,
  markNotificationAsSeen,
  clearAllNotifications,
} from "@/apis/commonApiCalls/notificationsApi";
import { useApiCall } from "@/apis/globalCatchError";
import LogoLoader from "@/components/LogoLoader";
import { EmptyState } from "@/components/ui/empty-state";
import { Bell, UserPlus, AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
  const [sentRequests, setSentRequests] = useState<FollowRequest[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [executeNotificationsFetch, isLoadingNotifications] =
    useApiCall(fetchNotifications);
  const [executeFollowRequestsFetch, isLoadingFollowRequests] =
    useApiCall(fetchFollowRequests);
  const [executeSentRequestsFetch, isLoadingSentRequests] =
    useApiCall(fetchSentRequests);
  const [executeMarkAsSeen] = useApiCall(markNotificationAsSeen);
  const [executeClearAll] = useApiCall(clearAllNotifications);

  const isLoading = isLoadingNotifications || isLoadingFollowRequests || isLoadingSentRequests;

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

  // Handle optimistic notification deletion
  const handleDeleteNotification = (notificationId: string) => {
    // Optimistically remove the notification from both unseen and seen lists
    setUnseenNotifications(prev => prev.filter(n => n._id !== notificationId));
    setSeenNotifications(prev => prev.filter(n => n._id !== notificationId));
  };

  const handleClearAll = async () => {
    // Store current state for potential rollback
    const originalUnseen = [...unseenNotifications];
    const originalSeen = [...seenNotifications];

    // Optimistically clear notifications
    setUnseenNotifications([]);
    setSeenNotifications([]);

    const result = await executeClearAll();
    if (result.status === 404 || !result.success) {
      // Revert to original state on error
      toast.error("Failed to Clear Notifications");
      setUnseenNotifications(originalUnseen);
      setSeenNotifications(originalSeen);
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
        // Filter out notifications of type "call"
        const filteredUnseen = Array.isArray(response.data.unseen) 
          ? response.data.unseen.filter(notification => notification.type !== "call")
          : [];
          
        const filteredSeen = Array.isArray(response.data.seen)
          ? response.data.seen.filter(notification => notification.type !== "call") 
          : [];
          
        setUnseenNotifications(filteredUnseen);
        setSeenNotifications(filteredSeen);
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

    // Fetch sent requests
    const sentRequestsResult = await executeSentRequestsFetch();
    if (sentRequestsResult.success && sentRequestsResult.data) {
      setSentRequests(sentRequestsResult.data.result || []);
    } else {
      setSentRequests([]);
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

  const handleSentRequestAction = async (
    requestId: string,
    success: boolean
  ) => {
    if (success) {
      // If the action was successful, keep the request removed
      setSentRequests((prev) => prev.filter((req) => req._id !== requestId));
    } else {
      // If the action failed, add the request back
      const failedRequest = sentRequests.find((req) => req._id === requestId);
      if (failedRequest) {
        setSentRequests((prev) => [...prev, failedRequest]);
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
          <TabsList className="grid grid-cols-3  ">
            <TabsTrigger value="notifications" className="cursor-pointer ">
              Notifications{" "}
              {unseenNotifications.length > 0 && `(${unseenNotifications.length})`}
            </TabsTrigger>
            <TabsTrigger value="friend-requests" className="cursor-pointer">
              Friend Requests{" "}
              {friendRequests.length > 0 && `(${friendRequests.length})`}
            </TabsTrigger>
            <TabsTrigger value="requests-sent" className="cursor-pointer">
              Sent Requests{" "}
              {sentRequests.length > 0 && `(${sentRequests.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="mt-4 ">
            <div className="space-y-4">
              {totalNotificationsCount > 0 ? (
                <>
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearAll}
                      className="text-foreground hover:text-muted-foreground cursor-pointer"
                    >
                      Clear All
                    </Button>
                  </div>
                  {[...unseenNotifications, ...seenNotifications.slice(0, 5)].map((notification) => (
                    <Notification
                      key={notification._id}
                      _id={notification._id}
                      title={(notification.details.notificationText || notification.details.content || "")}
                      profilePic={notification.sender.profilePic}
                      avatar={notification.sender.profilePic}
                      timestamp={notification.timestamp}
                      seen={notification.seen}
                      onMarkAsSeen={handleMarkAsSeen}
                      onDelete={handleDeleteNotification}
                      senderId={notification.sender.id}
                      entityDetails={{
                        entityType: notification.details.entityType,
                        entityId: notification.details.entityId,
                        entity: notification.details.entity
                      }}
                    />
                  ))}
                </>
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

          <TabsContent value="requests-sent" className="mt-4">
            <div className="space-y-4">
              {sentRequests.length > 0 ? (
                sentRequests.map((request) => (
                  <SentRequest
                    key={request._id}
                    {...request}
                    onActionComplete={handleSentRequestAction}
                  />
                ))
              ) : (
                <EmptyState
                  icon={ArrowRight}
                  title="No Requests Sent"
                  description="You haven't sent any Friend Requests yet."
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