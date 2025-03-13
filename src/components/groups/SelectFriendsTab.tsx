// import React from "react";
// import { Button } from "../ui/button";

// const SelectFriendsTab: React.FC = () => {
//   const friends = [
//     { id: 1, name: "Alex Johnson", avatar: "/profile/avatars/1.png", mutualFriends: 12 },
//     { id: 2, name: "Jamie Smith", avatar: "/profile/avatars/2.png", mutualFriends: 8 },
//     { id: 3, name: "Taylor Wilson", avatar: "/profile/avatars/3.png", mutualFriends: 5 },
//     { id: 4, name: "Morgan Lee", avatar: "/profile/avatars/4.png", mutualFriends: 3 },
//     { id: 5, name: "Casey Brown", avatar: "/profile/avatars/5.png", mutualFriends: 7 },
//   ];

//   return (
//     <div className="space-y-6">
//       <h2 className="text-xl font-medium mb-4">Invite Friends to Your Group</h2>
//       <div className="mb-4">
//         <input
//           type="text"
//           placeholder="Search friends..."
//           className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
//         />
//       </div>

//       <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
//         {/* impleement infinite scroll here */}
//         {friends.map((friend) => (
//           <div 
//             key={friend.id}
//             className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent"
//           >
//             <div className="flex items-center space-x-3">
//               <div className="w-12 h-12 rounded-full bg-muted overflow-hidden">
//                 <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" />
//               </div>
//               <div>
//                 <h3 className="font-medium">{friend.name}</h3>
//                 <p className="text-sm text-muted-foreground">{friend.mutualFriends} mutual friends</p>
//               </div>
//             </div>
//             <Button variant={"outline"}>
//               Invite
//             </Button>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default SelectFriendsTab; 

import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { addFriend, removeFriend } from "../../store/createGroupSlice";
import { RootState } from "../../store";
import { Friend } from "@/types/create_group";


const SelectFriendsTab: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Get selected friends from Redux
  const dispatch = useDispatch();
  const { selectedFriends } = useSelector(
    (state: RootState) => state.createGroup
  );
  const { userId } = useSelector((state: RootState) => state.createProfile);

  // Fetch friends list from API
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token') || '';
        
        const response = await axios.get('http://localhost:3000/api/followings', {
          headers: {
            'userid': userId,
            'token': token
          }
        });

        if (response.data.result) {
          setFriends(response.data.result);
        } else {
          setError("Failed to load friends list");
        }
      } catch (error) {
        console.error("Error fetching friends:", error);
        setError("Failed to load friends list. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [userId]);

  // Handle friend selection/deselection
  const handleToggleFriend = (friend: Friend) => {
    const isSelected = selectedFriends.some(f => f._id === friend._id);
    
    if (isSelected) {
      dispatch(removeFriend(friend._id));
    } else {
      dispatch(addFriend(friend));
    }
  };

  // Filter friends based on search term
  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-medium mb-4">Invite Friends to Your Group</h2>
      
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search friends..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-4">{error}</div>
      ) : (
        <>
          {selectedFriends.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Selected ({selectedFriends.length})</h3>
              <div className="flex flex-wrap gap-2">
                {selectedFriends.map((friend) => (
                  <div 
                    key={friend._id}
                    className="flex items-center bg-primary/10 rounded-full pl-2 pr-3 py-1"
                  >
                    <img 
                      src={friend.profilePic || "/profile/default-avatar.png"} 
                      alt={friend.name} 
                      className="w-6 h-6 rounded-full mr-2"
                    />
                    <span className="text-sm">{friend.name}</span>
                    <button 
                      onClick={() => dispatch(removeFriend(friend._id))}
                      className="ml-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {filteredFriends.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">
                {searchTerm ? "No friends match your search" : "No friends found"}
              </div>
            ) : (
              filteredFriends.map((friend) => {
                const isSelected = selectedFriends.some(f => f._id === friend._id);
                
                return (
                  <div 
                    key={friend._id}
                    className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                      isSelected 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:bg-accent"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-muted overflow-hidden">
                        <img 
                          src={friend.profilePic || "/profile/default-avatar.png"} 
                          alt={friend.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium">{friend.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {friend.bio ? 
                            friend.bio.length > 50 ? 
                              `${friend.bio.substring(0, 50)}...` : 
                              friend.bio 
                            : ""}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => handleToggleFriend(friend)}
                    >
                      {isSelected ? "Selected" : "Select"}
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SelectFriendsTab;