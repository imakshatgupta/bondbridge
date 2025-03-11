import { useEffect, useState } from "react";
import FriendRequest from "@/components/notifications/FriendRequest";
import Notification from "@/components/notifications/Notification";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type NotificationType = {
  id: number;
  title: string;
  description: string;
  avatar: string;
  timestamp: Date;
  seen: boolean;
};

type FriendRequestType = {
  requestId: number;
  name: string;
  bio: string;
  avatar: string;
};

const Notifications = () => {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequestType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleMarkAsSeen = (notificationId: number) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification.id === notificationId
          ? { ...notification, seen: true }
          : notification
      )
    );
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        
        // Get user authentication info from local storage or context
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('authToken');
        
        // Check if authentication info exists
        if (!userId || !token) {
          throw new Error("Authentication information missing");
        }

        const response = await fetch(
          process.env.REACT_APP_BACKEND_URL + "/get-notifications", 
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'userid': userId,
              'token': token
            }
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch notifications");
        }

        const data = await response.json();

        // Assuming the API returns an object with notifications and friendRequests arrays
        if (data.notifications) setNotifications(data.notifications);
        if (data.friendRequests) setFriendRequests(data.friendRequests);

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

    fetchNotifications();
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
      requestId: 2,
      name: "Jane Smith",
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
      requestId: 2,
      name: "Jane Smith",
      bio: "I am a software engineer",
      avatar: "/profile/user.png",
    },
    {
      requestId: 2,
      name: "Jane Smith",
      bio: "I am a software engineer",
      avatar: "/profile/user.png",
    },
  ];

  return (
    <div className="w-full">
      <h1 className="text-4xl font-semibold mb-5">Notifications</h1>

      {error && <div className="text-red-500 mb-4 hidden">{error}</div>}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <Tabs defaultValue="notifications" className="">
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
                friendRequests.map((friendRequest, index) => (
                  <FriendRequest
                    key={`${friendRequest.requestId}-${index}`}
                    {...friendRequest}
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
