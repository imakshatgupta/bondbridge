import { useEffect, useState, useRef, useCallback } from "react";
import FriendRequest from "@/components/notifications/FriendRequest";
import Notification from "@/components/notifications/Notification";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationType, FriendRequestType } from "@/types/notification";
import { fetchNotifications, markNotificationAsSeen } from "@/apis/commonApiCalls/notificationApi";

const Notifications = () => {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequestType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState("notifications");
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading || isFetchingMore) return;
    
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreItems();
      }
    });
    
    if (node) observerRef.current.observe(node);
  }, [isLoading, isFetchingMore, hasMore]);

  const handleMarkAsSeen = async (notificationId: number) => {
    try {
      await markNotificationAsSeen(notificationId);
      
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, seen: true }
            : notification
        )
      );
    } catch (err) {
      console.error("Error marking notification as seen:", err);
    }
  };

  const loadMoreItems = async () => {
    if (!hasMore || isFetchingMore) return;
    
    try {
      setIsFetchingMore(true);
      const nextPage = page + 1;
      
      // Fetch next page of data
      const data = await fetchNotifications(nextPage);
      
      if (activeTab === "notifications") {
          if (data.notifications && data.notifications.length > 0) {
          setNotifications(prev => [...prev, ...(data.notifications ?? [])]);
          setPage(nextPage);
        } else {
          setHasMore(false);
        }
      } else {
        if (data.friendRequests && data.friendRequests.length > 0) {
          setFriendRequests(prev => [...prev, ...(data.friendRequests ?? [])]);
          setPage(nextPage);
        } else {
          setHasMore(false);
        }
      }
    } catch (err) {
      console.error("Error fetching more items:", err);
    } finally {
      setIsFetchingMore(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setPage(1);
    setHasMore(true);
  };

  useEffect(() => {
    const getNotifications = async () => {
      try {
        setIsLoading(true);
        
        const data = await fetchNotifications(1);

        if (data.notifications) setNotifications(data.notifications);
        if (data.friendRequests) setFriendRequests(data.friendRequests);
        
        // Check if there might be more pages
        if ((activeTab === "notifications" && (!data.notifications || data.notifications.length < 10)) ||
            (activeTab === "friend-requests" && (!data.friendRequests || data.friendRequests.length < 10))) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError("Failed to load notifications. Please try again later.");

        // Fallback to dummy data if API fails
        setNotifications(dummyNotifications);
        setFriendRequests(dummyFriendRequests);
      } finally {
        setIsLoading(false);
      }
    };

    getNotifications();
  }, []);

  // Dummy data as fallback
  const dummyNotifications = [
    {
      id: 1,
      title: "1:1 sesssion with Michael",
      description: "click here to view details",
      avatar: "/profile/user.png",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      seen: false,
    },
    {
      id: 2,
      title: "Ali posted a new photo",
      description: "I am travelling the world...",
      avatar: "/profile/user.png",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      seen: true,
    },
    {
      id: 3,
      title: "Riya commented on your post",
      description: "When did you get your first tattoo?",
      avatar: "/profile/user.png",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      seen: false,
    },
  ];

  const dummyFriendRequests = [
    {
      requestId: 1,
      name: "John Doe",
      bio: "I am a software engineer",
      avatar: "/profile/user.png",
    },
    {
      requestId: 2,
      name: "Jane Smith",
      bio: "I am a software engineer",
      avatar: "/profile/user.png",
    },
    {
      requestId: 3,
      name: "Jane Smith",
      bio: "I am a software engineer",
      avatar: "/profile/user.png",
    },
    {
      requestId: 4,
      name: "Jane Smith",
      bio: "I am a software engineer",
      avatar: "/profile/user.png",
    },
    {
      requestId: 5,
      name: "Jane Smith",
      bio: "I am a software engineer",
      avatar: "/profile/user.png",
    },
    {
      requestId: 6,
      name: "Jane Smith",
      bio: "I am a software engineer",
      avatar: "/profile/user.png",
    },
  ];

  const handleAcceptSuccess = (requestId: number) => {
    setFriendRequests(prevRequests => 
      prevRequests.filter(request => request.requestId !== requestId)
    );
  }

  const handleRejectSuccess = (requestId: number) => {
    setFriendRequests(prevRequests => 
      prevRequests.filter(request => request.requestId !== requestId)
    );
  }

  return (
    <div className="w-full">
      <h1 className="text-4xl font-semibold mb-5">Notifications</h1>

      {error && <div className="text-red-500 mb-4 hidden">{error}</div>}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <Tabs defaultValue="notifications" className="" onValueChange={handleTabChange}>
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="notifications">
              Notifications{" "}
              {notifications.filter(n => !n.seen).length > 0 && `(${notifications.filter(n => !n.seen).length})`}
            </TabsTrigger>
            <TabsTrigger value="friend-requests">
              Friend Requests{" "}
              {friendRequests.length > 0 && `(${friendRequests.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="mt-4">
            <div className="space-y-4">
              {notifications.length > 0 ? (
                <>
                  {notifications.map((notification, index) => (
                    <div 
                      key={notification.id}
                      ref={index === notifications.length - 1 ? lastElementRef : undefined}
                    >
                      <Notification
                        {...notification}
                        onMarkAsSeen={handleMarkAsSeen}
                      />
                    </div>
                  ))}
                  {isFetchingMore && (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                    </div>
                  )}
                </>
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
                <>
                  {friendRequests.map((friendRequest, index) => (
                    <div 
                      key={`${friendRequest.requestId}-${index}`}
                      ref={index === friendRequests.length - 1 ? lastElementRef : undefined}
                    >
                      <FriendRequest 
                        {...friendRequest} 
                        onAcceptSuccess={handleAcceptSuccess}
                        onRejectSuccess={handleRejectSuccess}
                      />
                    </div>
                  ))}
                  {isFetchingMore && (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                    </div>
                  )}
                </>
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
