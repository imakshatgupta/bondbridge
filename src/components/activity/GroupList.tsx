import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAppSelector, useAppDispatch } from "../../store";
import { setActiveChat } from '../../store/chatSlice';
import { Group } from '@/types/activity';

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
        const transformedGroups = chatRooms
          .filter((chatRoom: any) => chatRoom.roomType === "group")
          .map((chatRoom: any) => ({
            id: chatRoom.chatRoomId,
            name: chatRoom.groupName,
            image: chatRoom.profileUrl,
            members: chatRoom.participants.length,
            lastActive: new Date(chatRoom.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }));

        setGroups(transformedGroups);
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

  const handleGroupSelect = (group: Group) => {
    const groupChatItem = {
      id: parseInt(group.id),
      name: group.name,
      avatar: group.image || '/defaultImage.png',
      isGroup: true,
      members: group.members,
      lastMessage: "",
      timestamp: group.lastActive,
      unread: false
    };
    console.log("group details: ", groupChatItem)
    dispatch(setActiveChat(groupChatItem));
  };

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div 
          key={group.id} 
          className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer"
          onClick={() => handleGroupSelect(group)}
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
