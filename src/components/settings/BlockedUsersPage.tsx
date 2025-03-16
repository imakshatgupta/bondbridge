import React, { useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store";
import {
  blockUser,
  setSettingsActive,
  unblockUser,
} from "@/store/settingsSlice";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserX, UserPlus, ArrowLeft } from "lucide-react";
import UserSearchDialog from "@/components/common/UserSearchDialog";

// Mock user data for search
const MOCK_USERS = [
  { id: "user3", name: "Alex Johnson", avatar: "/profile/avatars/3.png" },
  { id: "user4", name: "Sam Wilson", avatar: "/profile/avatars/4.png" },
  { id: "user5", name: "Taylor Swift", avatar: "/profile/avatars/5.png" },
  { id: "user6", name: "Jordan Peterson", avatar: "/profile/avatars/6.png" },
  { id: "user7", name: "Morgan Freeman", avatar: "/profile/avatars/1.png" },
  { id: "user8", name: "Emma Watson", avatar: "/profile/avatars/2.png" },
];

const BlockedUsersPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { blockedUsers } = useAppSelector((state) => state.settings);

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleUnblock = (userId: string) => {
    dispatch(unblockUser(userId));
  };

  const handleBlock = (userId: string) => {
    // Find the user in MOCK_USERS
    const user = MOCK_USERS.find((user) => user.id === userId);
    if (user) {
      dispatch(blockUser(user));
      setDialogOpen(false);
    }
  };

  const handleCloseSettings = () => {
    dispatch(setSettingsActive(false));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium cursor-pointer">
          <ArrowLeft
            className="h-4 w-4 mr-2 inline"
            onClick={handleCloseSettings}
          />
          Blocked Users
        </h3>

        <UserSearchDialog
          isOpen={dialogOpen}
          onOpenChange={setDialogOpen}
          onSelectUser={handleBlock}
          triggerButton={
            <Button variant="outline" size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Block User
            </Button>
          }
          title="Block a User"
          description="Search for a user to block. Blocked users won't be able to message you or see your content."
          actionIcon={<UserX className="h-4 w-4" />}
        />
      </div>

      {blockedUsers.length > 0 ? (
        <div className="space-y-2">
          {blockedUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 border border-border rounded-md"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>
                    {user.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">Blocked</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleUnblock(user.id)}
              >
                Unblock
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border border-dashed border-border rounded-md">
          <UserX className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">
            You haven't blocked any users yet
          </p>
        </div>
      )}
    </div>
  );
};

export default BlockedUsersPage;
