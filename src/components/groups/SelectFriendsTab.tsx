import React from "react";

const SelectFriendsTab: React.FC = () => {
  const friends = [
    { id: 1, name: "Alex Johnson", avatar: "/avatars/avatar1.jpg", mutualFriends: 12 },
    { id: 2, name: "Jamie Smith", avatar: "/avatars/avatar2.jpg", mutualFriends: 8 },
    { id: 3, name: "Taylor Wilson", avatar: "/avatars/avatar3.jpg", mutualFriends: 5 },
    { id: 4, name: "Morgan Lee", avatar: "/avatars/avatar4.jpg", mutualFriends: 3 },
    { id: 5, name: "Casey Brown", avatar: "/avatars/avatar5.jpg", mutualFriends: 7 },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-medium mb-4">Invite Friends to Your Group</h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search friends..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
        {friends.map((friend) => (
          <div 
            key={friend.id}
            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-medium">{friend.name}</h3>
                <p className="text-sm text-gray-500">{friend.mutualFriends} mutual friends</p>
              </div>
            </div>
            <button className="px-3 py-1 border border-gray-300 rounded-full text-sm hover:bg-gray-100">
              Invite
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectFriendsTab; 