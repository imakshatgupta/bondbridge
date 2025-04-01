import { useState } from "react";
import { getRelativeTime } from "../../lib/utils";
import { useNavigate } from "react-router-dom";

interface NotificationProps {
  _id: string;
  title: string;
  profilePic: string;
  timestamp: string;
  seen: boolean;
  onMarkAsSeen: (id: string) => void;
  entityDetails?: {
    entityType: string;
    entityId: string;
    entity?: {
      _id: string;
      feedId?: string;
    };
  };
}

const Notification = ({
  _id,
  title,
  profilePic,
  timestamp,
  seen,
  onMarkAsSeen,
  entityDetails,
}: NotificationProps) => {
  const [localseen, setLocalSeen] = useState(seen);
  const navigate = useNavigate();
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

  return (
    <div
      className={`flex items-center gap-4 p-4 border-b hover:bg-muted cursor-pointer`}
      onClick={handleClick}
    >
      <div className="w-12 h-12">
        <img
          src={profilePic}
          alt="User avatar"
          className="w-full h-full rounded-full object-cover"
        />
      </div>
      <div className="flex-1">
        <h3 className="font-medium text-xl text-foreground capitalize">{title}</h3>
      </div>
      <div className="text-sm capitalize text-muted-foreground">
        {getRelativeTime(new Date(timestamp))}
      </div>
      {!localseen && (
        <span className="h-2 w-2 bg-green-500 rounded-full"></span>
      )}
    </div>
  );
};

export default Notification;
