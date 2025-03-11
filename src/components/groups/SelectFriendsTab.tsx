import React from "react";
import { Button } from "../ui/button";

const SelectFriendsTab: React.FC = () => {
  const friends = [
    { id: 1, name: "Alex Johnson", avatar: "/profile/avatars/1.png", mutualFriends: 12 },
    { id: 2, name: "Jamie Smith", avatar: "/profile/avatars/2.png", mutualFriends: 8 },
    { id: 3, name: "Taylor Wilson", avatar: "/profile/avatars/3.png", mutualFriends: 5 },
    { id: 4, name: "Morgan Lee", avatar: "/profile/avatars/4.png", mutualFriends: 3 },
    { id: 5, name: "Casey Brown", avatar: "/profile/avatars/5.png", mutualFriends: 7 },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-medium mb-4">Invite Friends to Your Group</h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search friends..."
          className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
        {/* impleement infinite scroll here */}
        {friends.map((friend) => (
          <div 
            key={friend.id}
            className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-muted overflow-hidden">
                <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-medium">{friend.name}</h3>
                <p className="text-sm text-muted-foreground">{friend.mutualFriends} mutual friends</p>
              </div>
            </div>
            <Button variant={"outline"}>
              Invite
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectFriendsTab; 