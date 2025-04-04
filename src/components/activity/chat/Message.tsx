import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { Message as MessageType } from "@/store/chatSlice";
import { isPostShare, parsePostShare } from "@/utils/messageUtils";

interface MessageProps {
  message: MessageType;
  isFirstInSequence: boolean;
  isGroupChat: boolean;
  userId: string;
}

// Interface for shared post data
interface SharedPostData {
  _id: string;
  author: string;
  data: {
    content: string;
    media?: Array<{
      url: string;
      type: string;
    }>;
  };
  feedId: string;
  name: string;
}

const Message: React.FC<MessageProps> = ({
  message,
  isFirstInSequence,
  isGroupChat,
  userId,
}) => {
  // Check if message is a shared post using useState
  const [sharedPost, setSharedPost] = React.useState<SharedPostData | null>(
    null
  );

  React.useEffect(() => {
    // Check if the message is a post share using the utility function
    if (isPostShare(message.text)) {
      // Parse the post content using the utility function
      const parsedPost = parsePostShare(message.text as string);
      setSharedPost(parsedPost);
    } else {
      setSharedPost(null);
    }
  }, [message.text]);

  return (
    <div
      className={`flex items-start gap-2 ${
        message.isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Only show avatar for group chats and for the first message in a sequence from each sender */}
      {isGroupChat && isFirstInSequence && (
        <Link to={`/profile/${message.isUser ? userId : message.senderId}`}>
          <Avatar className="h-6 w-6 mt-1">
            <AvatarImage
              src={message.senderAvatar || ""}
              alt={message.senderName || "Unknown"}
            />
            <AvatarFallback>{(message.senderName || "?")[0]}</AvatarFallback>
          </Avatar>
        </Link>
      )}
      {/* Add a spacer when we don't show the avatar to keep alignment */}
      {isGroupChat && !isFirstInSequence && <div className="w-7" />}
      <div
        className={`max-w-[70%] p-3 break-words ${
          message.isUser
            ? `bg-primary text-primary-foreground ${
                isFirstInSequence ? "rounded-sm rounded-tr-2xl" : "rounded-sm"
              }`
            : `bg-muted text-foreground ${
                isFirstInSequence ? "rounded-sm rounded-tl-2xl" : "rounded-sm"
              }`
        }`}
      >
        {/* Show sender name only for group chats and first message from each sender */}
        {isGroupChat && !message.isUser && isFirstInSequence && (
          <p className="text-xs font-medium mb-1">
            {message.senderName || "Unknown"}
          </p>
        )}

        {/* Render shared post if available */}
        {sharedPost ? (
          <div className="shared-post">
            <div className="border rounded-md overflow-hidden bg-background text-foreground mb-2 cursor-pointer">
              <Link to={`/post/${sharedPost._id}`}>
                {/* Post image if available */}
                {sharedPost.data.media &&
                  sharedPost.data.media.length > 0 &&
                  sharedPost.data.media[0].type === "image" && (
                    <div className="w-full h-[150px] overflow-hidden">
                      <img
                        src={sharedPost.data.media[0].url}
                        alt="Shared post"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error("Failed to load shared post image");
                          // Replace with default image on error
                          e.currentTarget.src = "/placeholder-image.jpg";
                        }}
                      />
                    </div>
                  )}

                {/* Post video if available */}
                {sharedPost.data.media &&
                  sharedPost.data.media.length > 0 &&
                  sharedPost.data.media[0].type === "video" && (
                    <div className="w-full h-[150px] overflow-hidden">
                      <video
                        src={sharedPost.data.media[0].url}
                        className="w-full h-full object-cover"
                        controls
                        onError={(e) => {
                          console.error("Failed to load shared post video");
                          // We can't set a fallback for video, but we can handle the error
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  )}

                {/* Post content */}
                <div className="p-2 cursor-pointer">
                  <p className="text-xs font-medium mb-1">
                    Shared a post from {sharedPost.name || "Unknown"}
                  </p>
                  <p className="text-sm line-clamp-2">
                    {sharedPost.data.content || "No caption"}
                  </p>
                </div>
              </Link>
            </div>
          </div>
        ) : (
          <p>
            {typeof message.text === "string"
              ? message.text
              : JSON.stringify(message.text)}
          </p>
        )}

        <span className="text-xs opacity-70 block text-right mt-1">
          {message.timestamp}
        </span>
      </div>
    </div>
  );
};

export default Message;
