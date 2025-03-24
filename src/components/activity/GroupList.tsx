import { ChatItem } from "@/store/chatSlice";
import { useAppDispatch } from "../../store";
import { setActiveChat } from "../../store/chatSlice";
import { useEffect, useState, useMemo } from "react";

interface GroupListProps {
  groups: ChatItem[];
  isLoading: boolean;
  onSelectGroup: (group: ChatItem) => void;
}

const GroupList = ({ groups, isLoading, onSelectGroup }: GroupListProps) => {
  const dispatch = useAppDispatch();
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    // Get current user ID from local storage
    const userId = localStorage.getItem("userId");
    if (userId) {
      setCurrentUserId(userId);
    }
  }, []);

  const handleGroupSelect = (group: ChatItem) => {
    dispatch(setActiveChat(group));
    onSelectGroup(group);
    console.log("Group selected:", group);
  };

  const getUserStatusInGroup = (group: ChatItem): string | undefined => {
    if (!currentUserId) return undefined;
    
    // Find the current user in the group participants
    const currentUserParticipant = group.participants.find(
      (participant) => participant.userId === currentUserId
    );
    
    return currentUserParticipant?.status;
  };

  // Sort groups with "left" status at the bottom
  const sortedGroups = useMemo(() => {
    if (!currentUserId) return groups;

    return [...groups].sort((a, b) => {
      const statusA = getUserStatusInGroup(a);
      const statusB = getUserStatusInGroup(b);
      
      const isLeftA = statusA === "left";
      const isLeftB = statusB === "left";
      
      if (isLeftA && !isLeftB) {
        return 1; // A goes after B
      } else if (!isLeftA && isLeftB) {
        return -1; // A goes before B
      }
      
      // If both have the same left status, keep original order
      return 0;
    });
  }, [groups, currentUserId]);

  if (isLoading) {
    return <div className="flex justify-center p-4">Loading groups...</div>;
  }

  return (
    <div className="space-y-1">
      {sortedGroups.map((group) => {
        const userStatus = getUserStatusInGroup(group);
        const hasLeftGroup = userStatus === "left";
        
        return (
          <div
            key={group.id}
            className={`flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer ${hasLeftGroup ? 'opacity-80' : ''}`}
            onClick={() => handleGroupSelect(group)}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-muted overflow-hidden">
                <img
                  src={group.avatar || "/profile/user.png"}
                  alt={group.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-medium">{group.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {hasLeftGroup ? (
                    <span className="text-rose-500 font-medium">Left</span>
                  ) : (
                    group.lastMessage
                  )}
                </p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">
              {group.timestamp}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default GroupList;
