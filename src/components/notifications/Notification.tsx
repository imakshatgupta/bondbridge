import { useState } from "react";
import { getRelativeTime } from "../../lib/utils";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { deleteNotification } from "../../apis/commonApiCalls/notificationsApi";
import { useApiCall } from "../../apis/globalCatchError";

interface NotificationProps {
  _id: string;
  title: string;
  profilePic: string;
  timestamp: string;
  seen: boolean;
  onMarkAsSeen: (id: string) => void;
  onDelete?: (id: string) => void;
  entityDetails?: {
    entityType: string;
    entityId: string;
    entity?: {
      _id: string;
      feedId?: string;
    };
  };
  senderId: string;
}

const Notification = ({
  _id,
  title,
  profilePic,
  timestamp,
  seen,
  onMarkAsSeen,
  onDelete,
  entityDetails,
  senderId,
}: NotificationProps) => {
  const [localseen, setLocalSeen] = useState(seen);
  const navigate = useNavigate();
  const [executeDelete, isDeleting] = useApiCall(deleteNotification);
  // console.log("notifi data: ",_id,
  //   title,
  //   profilePic,
  //   timestamp,
  //   seen);

  const handleClick = async () => {
    if (!seen) {
      setLocalSeen(true);
      onMarkAsSeen(_id);
    }

    // Navigate to post if entityDetails are available
    if (entityDetails?.entityType === "feed" && entityDetails.entity?._id) {
      const feedId = entityDetails.entity.feedId || entityDetails.entityId;
      // Navigate to the post's comment page
      navigate(`/post/${feedId}`);
    }
  };

  const visitProfile = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the notification click event from firing
    if (senderId) {
      navigate(`/profile/${senderId}`);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the notification click event from firing
    const { success } = await executeDelete(_id);
    
    if (success && onDelete) {
      onDelete(_id);
    }
  };

  return (
    <div
      className={`flex items-center gap-4 p-4 border-b hover:bg-muted`}
    >
      <div className="w-12 h-12">
        <img
          src={profilePic}
          alt="User avatar"
          onClick={visitProfile}
          className="w-full h-full rounded-full object-cover cursor-pointer"
        />
      </div>
      <div className="flex-1 cursor-pointer">
        <h3 className="font-medium text-xl text-foreground capitalize" onClick={handleClick}>
          {title}
        </h3>
      </div>
      <div className="text-sm capitalize text-muted-foreground">
        {getRelativeTime(new Date(timestamp))}
      </div>
      {!localseen && (
        <span className="h-2 w-2 bg-green-500 rounded-full"></span>
      )}
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="p-1.5 text-foreground cursor-pointer hover:text-muted-foreground hover:bg-destructive/10 rounded-full transition-colors"
        aria-label="Delete notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Notification;
