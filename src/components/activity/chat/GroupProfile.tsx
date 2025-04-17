import React, { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PlusIcon, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { deleteGroup } from "@/apis/commonApiCalls/activityApi";
import { useAppDispatch, useAppSelector } from "@/store";
import { deleteGroup as deleteGroupAction, setActiveChat, restoreGroup } from "@/store/chatSlice";
import { toast } from "sonner";

interface Participant {
  userId: string;
  name: string;
  profilePic: string;
  status?: string;
}

interface GroupProfileProps {
  name: string;
  avatar: string;
  bio?: string;
  participants: Participant[];
  admin: string;
  currentUserId: string;
  hasLeftGroup: boolean;
  onBack: () => void;
  onLeaveGroup: () => void;
  onAddMembers: () => void;
  groupId: string;
  onClose: () => void;
}

const GroupProfile: React.FC<GroupProfileProps> = ({
  name,
  avatar,
  bio,
  participants,
  admin,
  currentUserId,
  hasLeftGroup,
  onBack,
  onLeaveGroup,
  onAddMembers,
  groupId,
  onClose,
}) => {
  // Find if current user is admin
  const isAdmin = admin === currentUserId;
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const dispatch = useAppDispatch();
  const originalGroup = useAppSelector(state => 
    state.chat.filteredChats.groups.find(group => group.id === groupId)
  );

  // Filter only active participants
  const activeParticipants = participants.filter(member => member.status === "active");

  const handleDeleteGroup = async () => {
    try {
      setIsDeleting(true);
      setIsDeleteDialogOpen(false);
      
      // Immediately close the profile and chat view
      dispatch(setActiveChat(null));
      
      // Store a copy of the original group for restoration if needed
      const groupToRestore = originalGroup;
      
      // Optimistically remove the group from the list
      dispatch(deleteGroupAction(groupId));
      
      // Make the API call to delete the group
      const response = await deleteGroup(groupId);
      
      if (response.success) {
        // Successfully deleted, call onClose to refresh the chat list
        onClose();
      } else {
        // If the API call fails, restore the group
        toast.error("Failed to delete group. Please try again.");
        
        // If we have the original group data, restore it
        if (groupToRestore) {
          dispatch(restoreGroup(groupToRestore));
        }
      }
    } catch (error) {
      // Handle error and restore the group
      console.error("Failed to delete group:", error);
      toast.error("Failed to delete group. Please try again.");
      
      // If we have the original group data, restore it
      if (originalGroup) {
        dispatch(restoreGroup(originalGroup));
      }
    } finally {
      setIsDeleting(false);
    }

  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Back button header */}
      <div className="flex items-center p-4 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="mr-2 cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-semibold">Group Info</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Group avatar and name */}
        <div className="flex flex-col items-center py-6 px-4 border-b">
          <div className="rounded-full border-4 border-primary p-1">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatar} alt={name} />
              <AvatarFallback>
                {name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <h3 className="text-xl font-semibold mb-1">{name}</h3>
          <p className="text-muted-foreground text-sm mb-4">
            {activeParticipants.length} Participants
          </p>

          {/* Group bio */}
          {bio && (
            <p className="text-center text-sm text-muted-foreground">
              {bio}
            </p>
          )}

          {/* Action buttons */}
          <div className="flex w-full gap-2 mt-6 justify-center">
            {!hasLeftGroup && (
              <Button
                variant="outline"
                className="px-6 cursor-pointer border-2 border-destructive hover"
                onClick={onLeaveGroup}
              >
                Leave
              </Button>
            )}
            {isAdmin && !hasLeftGroup && (
              <>
                <Button
                  variant="destructive"
                  className="px-6 cursor-pointer"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  Delete <Trash2 className="h-4 w-4 ml-2" />
                </Button>
                <Button
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 cursor-pointer"
                  onClick={onAddMembers}
                >
                  Add <PlusIcon className="h-4 w-4 ml-2" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Participants list */}
        <div className="pt-4 px-4 overflow-y-auto max-h-[45vh]">
          <h4 className="font-medium mb-4">Participants</h4>
          <div>
            {activeParticipants
              .sort((a, b) => {
                // Sort admin to the top
                if (a.userId === admin) return -1;
                if (b.userId === admin) return 1;
                return 0;
              })
              .map((member) => (
                <div
                  key={member.userId}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={member.profilePic}
                        alt={member.name}
                      />
                      <AvatarFallback>
                        {member.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="font-medium">{member.name}</p>
                      <span className="text-xs text-muted-foreground">
                        {admin === member.userId ? 'Admin' : 'Member'}
                      </span>
                    </div>
                  </div>
                  {member.userId !== currentUserId && (
                    <Link
                      to={`/profile/${member.userId}`}
                      className="text-foreground text-sm cursor-pointer border-2 border-primary rounded-full px-2 py-1"
                    >
                      View
                    </Link>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Delete Group Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Group</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this group? This action cannot be undone and all messages will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row justify-end gap-2 sm:justify-end">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteGroup}
              disabled={isDeleting}
              className="cursor-pointer"
            >
              {isDeleting ? "Deleting..." : "Delete Group"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GroupProfile; 