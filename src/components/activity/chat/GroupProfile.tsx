import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PlusIcon, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

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
}) => {
  // Find if current user is admin
  const isAdmin = admin === currentUserId;

  // Filter only active participants
  const activeParticipants = participants.filter(member => member.status === "active");

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Back button header */}
      <div className="flex items-center p-4 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="mr-2"
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
                className="border-border px-6 cursor-pointer"
                onClick={onLeaveGroup}
              >
                Leave
              </Button>
            )}
            {isAdmin && (
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 cursor-pointer"
                onClick={onAddMembers}
              >
                Add <PlusIcon className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>

        {/* Shared media section */}
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h3 className="text-muted-foreground">shared media (23)</h3>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
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
                      className="text-primary text-sm cursor-pointer"
                    >
                      View
                    </Link>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupProfile; 