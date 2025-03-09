import FriendRequest from "@/components/notifications/FriendRequest"
import Notification from "@/components/notifications/Notification"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const Notifications = () => {
    const dummyNotifications = [
        {
            id: 1,
            title: "1:1 sesssion with Michael",
            description: "click here to view details",
            avatar: "/profile/user.png",
            timestamp: "2h",
        },
        {
            id: 2,
            title: "Ali posted a new photo",
            description: "I am travelling the world...",
            avatar: "/profile/user.png",
            timestamp: "1d",
        },
        {
            id: 3,
            title: "Riya commented on your post",
            description: "When did you get your first tattoo?",
            avatar: "/profile/user.png",
            timestamp: "2d",
        },
        
    ]

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
    ]
  return (
    <div className="w-full">
        <h1 className="text-4xl font-semibold mb-5">Notifications</h1>
      <Tabs defaultValue="notifications" className="">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="friend-requests">Friend Requests</TabsTrigger>
        </TabsList>
        
        <TabsContent value="notifications" className="mt-4">
          <div className="space-y-4">
            {/* Dummy notifications - replace with your notification components */}
            {dummyNotifications.map((notification) => (
                <Notification key={notification.id} {...notification} />
            ))}
           
          </div>
        </TabsContent>

        <TabsContent value="friend-requests" className="mt-4">
          <div className="space-y-4">
            {/* Dummy friend requests - replace with your friend request components */}
            {dummyFriendRequests.map((friendRequest, index) => (
                <FriendRequest key={index} {...friendRequest} />
            ))}

          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Notifications
