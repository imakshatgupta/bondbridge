import { useState } from "react";
import { getRelativeTime } from "../../lib/utils";

interface NotificationProps {
  id: number;
  title: string;
  description: string;
  avatar: string;
  timestamp: string;
  seen: boolean;
  onMarkAsSeen: (id: number) => void;
}

const Notification = ({
  id,
  title,
  description,
  avatar,
  timestamp,
  seen,
  onMarkAsSeen,
}: NotificationProps) => {
  const [localseen, setLocalSeen] = useState(seen);

  const handleClick = async () => {
    if (seen) return;
    setLocalSeen(true);
    onMarkAsSeen(id);
  };

  return (
    <div
      className={`flex items-center gap-4 p-4 border-b hover:bg-muted cursor-pointer`}
      onClick={handleClick}
    >
      <div className="w-12 h-12">
        <img
          src={avatar}
          alt="User avatar"
          className="w-full h-full rounded-full object-cover"
        />
      </div>
      <div className="flex-1">
        <h3 className="font-medium text-xl text-foreground">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
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
