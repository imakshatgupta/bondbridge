import { useEffect, useState } from "react";
import { useAppSelector } from "@/store";
import CommunityPostFeed from "./CommunityPostFeed";
import { EmptyState } from "@/components/ui/empty-state";
import { Building2 } from "lucide-react";

interface CommunityFeedProps {
  onBack?: () => void;
}

const CommunityFeed = ({ onBack }: CommunityFeedProps) => {
  const { activeChat } = useAppSelector((state) => state.chat);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Reset error state when active chat changes
    setHasError(false);
  }, [activeChat]);

  if (!activeChat) {
    return (
      <div className="h-full flex items-center justify-center">
        <EmptyState
          icon={Building2}
          title="No Community Selected"
          description="Select a community to view posts"
          className="max-w-md"
        />
      </div>
    );
  }

  if (activeChat.type !== "community") {
    return (
      <div className="h-full flex items-center justify-center">
        <EmptyState
          icon={Building2}
          title="Not a Community"
          description="The selected chat is not a community"
          className="max-w-md"
        />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="h-full flex items-center justify-center">
        <EmptyState
          icon={Building2}
          title="Error Loading Community"
          description="There was an error loading the community posts"
          className="max-w-md"
        />
      </div>
    );
  }

  return (
    <CommunityPostFeed
      activeCommunityChatItem={activeChat}
      onBack={onBack}
    />
  );
};

export default CommunityFeed; 