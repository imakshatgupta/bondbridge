import { useState } from "react";
import { getRelativeTime } from "../../lib/utils";

interface NotificationProps {
  _id: number;
  title: string;
  profilePic: string;
  timestamp: string;
  seen: boolean;
  onMarkAsSeen: (id: number) => void;
}

const Notification = ({
  _id,
  title,
  profilePic,
  timestamp,
  seen,
  onMarkAsSeen,
}: NotificationProps) => {
  const [localseen, setLocalSeen] = useState(seen);
  // console.log("notifi data: ",_id,
  //   title,
  //   profilePic,
  //   timestamp,
  //   seen);

  const handleClick = async () => {
    if (seen) return;
    setLocalSeen(true);
    onMarkAsSeen(_id);
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
        <h3 className="font-medium text-xl text-foreground">{title}</h3>
      </div>
      <div className="text-sm text-muted-foreground">
        {getRelativeTime(new Date(timestamp))}
      </div>
      {!localseen && (
        <span className="h-2 w-2 bg-green-500 rounded-full"></span>
      )}
    </div>
  );
};

export default Notification;
