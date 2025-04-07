import { SearchHistoryUser } from "@/apis/apiTypes/searchHistory";
import { Avatar } from "./ui/avatar";
import { Button } from "./ui/button";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { removeFromSearchHistory } from "@/apis/commonApiCalls/searchHistoryApi";
import { useApiCall } from "@/apis/globalCatchError";

interface SearchHistoryItemProps {
  user: SearchHistoryUser;
  onRemove: () => void;
}

export const SearchHistoryItem = ({ user, onRemove }: SearchHistoryItemProps) => {
  const navigate = useNavigate();
  // Use the useApiCall hook to handle API call with error handling
  const [executeRemoveFromHistory, isRemoving] = useApiCall(removeFromSearchHistory);

  const handleProfileClick = () => {
    navigate(`/profile/${user.userId}`);
  };

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRemoving) return;

    const { success } = await executeRemoveFromHistory(user.userId);
    // Only trigger the onRemove callback if the API call was successful
    if (success) {
      onRemove();
    }
  };

  return (
    <div
      className="flex items-center justify-between p-3 hover:bg-accent rounded-lg cursor-pointer"
      onClick={handleProfileClick}
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <img src={user.profilePic} alt={user.name} className="h-8 w-8 rounded-full"/>
        </Avatar>
        <span className="font-medium text-sm">{user.name}</span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 cursor-pointer border-1 border-destructive hover:border-foreground hover:bg-foreground/10"
        onClick={handleRemove}
        disabled={isRemoving}
      >
        <X className={`h-4 w-4 ${isRemoving ? "animate-spin" : "text-foreground"}`} />
      </Button>
    </div>
  );
}; 