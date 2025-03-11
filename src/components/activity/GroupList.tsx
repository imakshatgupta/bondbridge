// import React from 'react';
// import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// interface Group {
//   id: number;
//   name: string;
//   image: string;
//   members: number;
//   lastActive: string;
// }

// const groups: Group[] = [
//   {
//     id: 1,
//     name: 'Design Team',
//     image: '/profile/community/pubg.png',
//     members: 12,
//     lastActive: '5m ago'
//   },
//   {
//     id: 2,
//     name: 'Project Alpha',
//     image: '/profile/community/pubg.png',
//     members: 8,
//     lastActive: '1h ago'
//   },
//   {
//     id: 3,
//     name: 'Weekend Hangout',
//     image: '/profile/community/pubg.png',
//     members: 6,
//     lastActive: '3h ago'
//   }
// ];

// const GroupList: React.FC = () => {
//   return (
//     <div className="space-y-4">
//       {groups.map((group) => (
//         <div 
//           key={group.id} 
//           className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer"
//         >
//           <div className="flex items-center gap-3">
//             <Avatar className="h-12 w-12 rounded-lg">
//               <AvatarImage src={group.image} alt={group.name} className="object-cover" />
//               <AvatarFallback className="rounded-lg">{group.name[0]}</AvatarFallback>
//             </Avatar>
//             <div>
//               <h3 className="font-medium">{group.name}</h3>
//               <p className="text-sm text-muted-foreground">{group.members} members</p>
//             </div>
//           </div>
//           <span className="text-xs text-muted-foreground">{group.lastActive}</span>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default GroupList; 

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAppSelector, useAppDispatch } from "../../store";

interface Group {
  id: string;
  name: string;
  image: string | null;
  members: number;
  lastActive: string;
}

const GroupList: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  const token = localStorage.getItem("token");
  const { userId } = useAppSelector(state => state.createProfile);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/get-all-chat-rooms", {
          headers: {
            'token': token,
            'userid': userId,
          },
        });
        console.log("API Response:", response.data); // Debug log

        const chatRooms = response.data.chatRooms;

        // Filter and map chat rooms safely
        const transformedGroup = chatRooms
          .filter((chatRoom: any) => chatRoom.roomType === "group")
          .map((chatRoom: any) => ({
            id: chatRoom.chatRoomId,
            name: chatRoom.groupName,
            image: chatRoom.profileUrl,
            members: chatRoom.participants.length,
            lastActive: new Date(chatRoom.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }));

        setGroups([transformedGroup]);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch groups');
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  if (loading) return <p className="text-center text-gray-500">Loading groups...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div 
          key={group.id} 
          className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 rounded-lg">
              <AvatarImage 
                src={group.image || '/defaultImage.png'} 
                alt={group.name} 
                className="object-cover" 
              />
              <AvatarFallback className="rounded-lg">{group.name?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{group.name}</h3>
              <p className="text-sm text-muted-foreground">{group.members} members</p>
            </div>
          </div>
          <span className="text-xs text-muted-foreground">
            {new Date(group.lastActive).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
};

export default GroupList;
