import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Search, Check } from "lucide-react";

// Define interface for follower with selected state
export interface SimpleFollower {
  _id: string;
  name: string;
  avatar: string;
  selected: boolean;
}

interface InviteFollowersProps {
  filteredFollowers: SimpleFollower[];
  isLoadingFollowers: boolean;
  searchTerm: string;
  selectedFollowers: string[];
  isInviting: boolean;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFollowerClick: (followerId: string) => void;
  onInvite: () => void;
  onClose: () => void;
}

const InviteFollowers: React.FC<InviteFollowersProps> = ({
  filteredFollowers,
  isLoadingFollowers,
  searchTerm,
  selectedFollowers,
  isInviting,
  onSearchChange,
  onFollowerClick,
  onInvite,
  onClose
}) => {
  return (
    <div className="h-full flex flex-col bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="cursor-pointer mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="font-medium">Add Friends</h2>
      </div>

      {/* Search bar */}
      <div className="p-4 relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search followers"
            className="pl-10 bg-muted/50 border-border text-foreground rounded-full"
            value={searchTerm}
            onChange={onSearchChange}
          />
        </div>
      </div>

      {/* Followers list */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoadingFollowers ? (
          // Loading state
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((_, i) => (
              <div key={i} className="flex flex-col items-center justify-center py-2">
                <Skeleton className="h-20 w-20 rounded-full mb-2" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : filteredFollowers.length === 0 ? (
          // Empty state
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-4">
            <p className="text-center">
              {searchTerm.trim() !== ""
                ? "No followers match your search"
                : "No followers to add"}
            </p>
          </div>
        ) : (
          // List of followers - grid layout with theme-colored selection ring
          <div className="grid grid-cols-3 gap-x-4 gap-y-6">
            {filteredFollowers.map((follower) => (
              <div
                key={follower._id}
                className="flex flex-col items-center justify-center cursor-pointer"
                onClick={() => onFollowerClick(follower._id)}
              >
                <div className="relative mb-2">
                  <div className={`rounded-full ${follower.selected ? 'p-[2px] bg-primary' : 'p-0'}`}>
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={follower.avatar} alt={follower.name} />
                      <AvatarFallback className="bg-muted">
                        {follower.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  {follower.selected && (
                    <div className="absolute -bottom-1 -right-1 bg-primary rounded-full h-6 w-6 flex items-center justify-center border-2 border-background">
                      <Check className="h-4 w-4 text-primary-foreground" strokeWidth={3} />
                    </div>
                  )}
                </div>
                <span className="text-xs text-center text-muted-foreground max-w-full truncate px-1">
                  {follower.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add button */}
      <div className="p-4">
        <Button
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full py-6 cursor-pointer"
          disabled={selectedFollowers.length === 0 || isInviting}
          onClick={onInvite}
        >
          {isInviting ? "Adding..." : `Add ${selectedFollowers.length > 0 ? selectedFollowers.length : ""} to Group`}
        </Button>
      </div>
    </div>
  );
};

export default InviteFollowers; 