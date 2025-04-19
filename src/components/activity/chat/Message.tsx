import React, { useRef, useEffect, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { Message as MessageType, Reaction } from "@/store/chatSlice";
import { isPostShare, parsePostShare } from "@/utils/messageUtils";
import { CornerUpLeft } from "lucide-react";
import EmojiPicker from "emoji-picker-react";

// Default quick reactions
const DEFAULT_REACTIONS = ["👍", "❤️", "😂", "😮", "😢"];

interface MessageProps {
  message: MessageType;
  isFirstInSequence: boolean;
  isGroupChat: boolean;
  userId: string;
  onReply?: (message: MessageType) => void;
  messages?: MessageType[]; // All messages to find the replied message
  onAddReaction?: (messageId: string, reaction: string) => void;
  onRemoveReaction?: (messageId: string) => void;
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
  isCommunity?: boolean;
  communityId?: string;
}

const Message: React.FC<MessageProps> = ({
  message,
  isFirstInSequence,
  isGroupChat,
  userId,
  onReply,
  messages = [],
  onAddReaction,
  onRemoveReaction,
}) => {
  // Check if message is a shared post using useState
  const [sharedPost, setSharedPost] = useState<SharedPostData | null>(null);

  // State to track if the message is "long" and needs timestamp on new line
  const [isLongMessage, setIsLongMessage] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  // Reaction states
  const [showReactionMenu, setShowReactionMenu] = useState(false);
  const [showFullEmojiPicker, setShowFullEmojiPicker] = useState(false);
  const reactionButtonRef = useRef<HTMLButtonElement>(null);
  const reactionMenuRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Find the replied to message if this message is a reply
  const repliedToMessage = React.useMemo(() => {
    if (!message.replyTo) return null;
    return messages.find((msg) => msg.id === message.replyTo);
  }, [message.replyTo, messages]);


  // Group reactions by emoji for display
  const groupedReactions = React.useMemo(() => {
    if (!message.reactions || message.reactions.length === 0) return {};

    return message.reactions.reduce<Record<string, Reaction[]>>(
      (acc, reaction) => {
        if (!acc[reaction.reaction]) {
          acc[reaction.reaction] = [];
        }
        acc[reaction.reaction].push(reaction);
        return acc;
      },
      {}
    );
  }, [message.reactions]);

  // Check if the current user has reacted
  const userReaction = React.useMemo(() => {
    if (!message.reactions || message.reactions.length === 0) return null;
    return (
      message.reactions.find((reaction) => reaction.userId === userId)
        ?.reaction || null
    );
  }, [message.reactions, userId]);

  useEffect(() => {
    // Check if the message is a post share using the utility function
    if (isPostShare(message.text)) {
      // Parse the post content using the utility function
      const parsedPost = parsePostShare(message.text as string);
      setSharedPost(parsedPost);
    } else {
      setSharedPost(null);
    }
  }, [message.text]);

  // Check if message is long enough to need timestamp on a new line
  useEffect(() => {
    const measureTextWidth = () => {
      if (!textRef.current || typeof message.text !== "string") return;

      const messageText = message.text;
      const timestamp = message.timestamp;

      // Create a temporary span to measure the text width accurately
      const span = document.createElement("span");
      span.style.visibility = "hidden";
      span.style.position = "absolute";
      span.style.whiteSpace = "nowrap";
      span.style.font = window.getComputedStyle(textRef.current).font;
      span.innerHTML = messageText;
      document.body.appendChild(span);

      // Create another span for the timestamp
      const timeSpan = document.createElement("span");
      timeSpan.style.visibility = "hidden";
      timeSpan.style.position = "absolute";
      timeSpan.style.whiteSpace = "nowrap";
      timeSpan.style.font = "0.75rem/1 sans-serif"; // Approximate the timestamp font
      timeSpan.innerHTML = timestamp;
      document.body.appendChild(timeSpan);

      // Get the available container width (estimate)
      const containerWidth =
        textRef.current.parentElement?.parentElement?.offsetWidth || 250;
      const availableWidth = containerWidth * 0.8; // Leave some margin

      // Calculate widths
      const textWidth = span.offsetWidth;
      const timestampWidth = timeSpan.offsetWidth + 16; // Add some padding

      // Clean up the temporary elements
      document.body.removeChild(span);
      document.body.removeChild(timeSpan);

      // Check if both the text and timestamp can fit on the same line
      const isLong = textWidth + timestampWidth > availableWidth;
      setIsLongMessage(isLong);
    };

    // Run the measurement after the component has rendered
    requestAnimationFrame(measureTextWidth);
  }, [message.text, message.timestamp]);

  // Handle click outside for reaction menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showReactionMenu &&
        reactionMenuRef.current &&
        reactionButtonRef.current &&
        !reactionMenuRef.current.contains(event.target as Node) &&
        !reactionButtonRef.current.contains(event.target as Node)
      ) {
        setShowReactionMenu(false);
      }

      if (
        showFullEmojiPicker &&
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowFullEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showReactionMenu, showFullEmojiPicker]);

  // Handle double click on horizontal area to toggle reply
  const handleDoubleClick = (e: React.MouseEvent) => {
    // Only trigger when onReply is available
    if (onReply) {
      // Make sure we're not clicking on the message content itself
      const target = e.target as HTMLElement;
      if (
        target.classList.contains("message-horizontal-area") ||
        target.classList.contains("message-container")
      ) {
        e.preventDefault();
        e.stopPropagation();
        onReply(message);
      }
    }
  };

  // Handle reaction selection
  const handleReactionClick = (reaction: string) => {
    if (!onAddReaction || !onRemoveReaction) return;

    // If user has already selected this reaction, remove it
    if (userReaction === reaction) {
      onRemoveReaction(message.id);
    } else {
      // Otherwise add the new reaction
      onAddReaction(message.id, reaction);
    }

    // Close the menu
    setShowReactionMenu(false);
  };

  // Handle emoji picker selection
  const handleEmojiSelect = (emojiData: { emoji: string }) => {
    if (onAddReaction) {
      onAddReaction(message.id, emojiData.emoji);
      setShowFullEmojiPicker(false);
      setShowReactionMenu(false);
    }
  };

  return (
    <div
      className={`flex items-start w-full gap-2 ${
        message.isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Only show avatar for group chats and for the first message in a sequence from each sender */}
      {isGroupChat && isFirstInSequence && !message.isUser && (
        <Link to={`/profile/${message.senderId}`}>
          <Avatar className="h-6 w-6 mt-1">
            <AvatarImage
              src={message.senderAvatar || ""}
              alt={message.senderName || "Unknown"}
            />
            <AvatarFallback>{(message.senderName || "?")[0]}</AvatarFallback>
          </Avatar>
        </Link>
      )}
      {/* Use userId in the profile link for the user's own messages */}
      {isGroupChat && isFirstInSequence && message.isUser && (
        <Link to={`/profile/${userId}`}>
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
      {isGroupChat && !isFirstInSequence && !message.isUser && (
        <div className="w-7" />
      )}
      <div
        className={`flex flex-col ${
          message.isUser ? "items-end" : "items-start"
        } group w-full message-container message-horizontal-area relative`}
        onDoubleClick={handleDoubleClick}
      >
        <div
          className={`flex w-fit items-center message-horizontal-area gap-1 group ${
            message.isUser ? "justify-end" : "justify-start"
          }`}
        >
          {/* Reply button for other user's messages - appears on left */}
          {onReply && message.isUser && (
            <button
              onClick={() => onReply(message)}
              className="text-xs cursor-pointer opacity-0 group-hover:opacity-70 hover:opacity-100 p-1 h-6 w-6 flex items-center justify-center rounded-full bg-background/80 transition-opacity"
              aria-label="Reply to message"
            >
              <CornerUpLeft size={14} />
            </button>
          )}

          {/* Reaction button for user's messages - appears on left */}
          {/* {onAddReaction && message.isUser && (
            <button
              ref={reactionButtonRef}
              onClick={() => setShowReactionMenu(!showReactionMenu)}
              className="text-xs cursor-pointer opacity-0 group-hover:opacity-70 hover:opacity-100 p-1 h-6 w-6 flex items-center justify-center rounded-full bg-background/80 transition-opacity"
              aria-label="Add reaction"
            >
              <Smile size={14} />
            </button>
          )} */}

          <div
            className={`p-[0.35rem] break-words min-w-[7rem] max-w-[80%] ${
              message.isUser
                ? `bg-primary text-primary-foreground ${
                    isFirstInSequence
                      ? "rounded-md rounded-tr-none mt-1"
                      : "rounded-md"
                  }`
                : `bg-muted text-foreground ${
                    isFirstInSequence
                      ? "rounded-md rounded-tl-none"
                      : "rounded-md"
                  }`
            }`}
          >
            {/* Display the message this is replying to, if any */}
            {repliedToMessage && (
              <div
                className={`flex flex-col w-full ${
                  message.isUser ? "items-end" : "items-start"
                } mb-1`}
              >
                <div
                  className={`flex w-full items-center text-xs gap-1 ${
                    message.isUser ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`border-l-4 w-full ${
                      message.isUser
                        ? "border-l-gray-400 bg-gray-700"
                        : "border-l-primary bg-primary/40"
                    } rounded-sm pl-2 py-1 pr-3 max-w-[200px] overflow-hidden`}
                  >
                    <div className="text-xs font-semibold">
                      {repliedToMessage.isUser
                        ? "You"
                        : repliedToMessage.senderName || "Unknown"}
                    </div>
                    <div className="text-xs truncate">
                      {typeof repliedToMessage.text === "string"
                        ? repliedToMessage.text
                        : "Shared content"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Show sender name only for group chats and first message from each sender */}
            {isGroupChat && !message.isUser && isFirstInSequence && (
              <p className="text-xs font-medium mb-1 text-primary">
                {message.senderName || "Unknown"}
              </p>
            )}

            {/* Render shared post if available */}
            {sharedPost ? (
              <div className="shared-post">
                <div className="border rounded-md overflow-hidden bg-background text-foreground mb-2 cursor-pointer">
                  <Link
                    to={
                      sharedPost.isCommunity && sharedPost.communityId
                        ? `/community/${sharedPost.communityId}/${sharedPost._id}`
                        : `/post/${sharedPost._id}`
                    }
                  >
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
                <span className="text-xs opacity-70 block text-right">
                  {message.timestamp}
                </span>
              </div>
            ) : (
              <div className="px-2 py-1">
                <div className="flex flex-wrap items-end justify-between gap-1">
                  <p
                    ref={textRef}
                    className={`break-words whitespace-normal ${
                      !isLongMessage ? "pr-2" : "w-full"
                    }`}
                  >
                    {typeof message.text === "string"
                      ? message.text
                      : JSON.stringify(message.text)}
                  </p>

                  {/* Inline timestamp for short messages */}
                  {!isLongMessage && (
                    <span className="text-xs opacity-70 whitespace-nowrap ml-1">
                      {message.timestamp}
                    </span>
                  )}
                </div>

                {/* Bottom timestamp for long messages */}
                {isLongMessage && (
                  <span className="text-xs opacity-70 block text-right mt-1">
                    {message.timestamp}
                  </span>
                )}
              </div>
            )}

            {/* Display reactions if any */}
            {message.reactions && message.reactions.length > 0 && (
              <div
                className={`flex flex-wrap absolute -bottom-5 gap-1 mt-1 ${
                  message.isUser ? "justify-end" : "justify-start"
                }`}
              >
                {Object.entries(groupedReactions).map(([emoji, reactions]) => (
                  <button
                    key={emoji}
                    onClick={() => handleReactionClick(emoji)}
                    className={`text-xs px-2 cursor-pointer py-0.5 rounded-full flex items-center gap-1
                      ${
                        reactions.some((r) => r.userId === userId)
                          ? "bg-foreground/30 border border-primary/30"
                          : "bg-foreground/50 border border-muted-foreground/20"
                      } hover:bg-primary/30 transition-colors`}
                  >
                    <span>{emoji}</span>
                    <span className="text-xs">{reactions.length}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reply button for other user's messages - appears on right */}
          {onReply && !message.isUser && (
            <button
              onClick={() => onReply(message)}
              className="text-xs opacity-0 cursor-pointer group-hover:opacity-70 hover:opacity-100 p-1 h-6 w-6 flex items-center justify-center rounded-full bg-background/80 transition-opacity"
              aria-label="Reply to message"
            >
              <CornerUpLeft size={14} />
            </button>
          )}

          {/* Reaction button for other user's messages - appears on right */}
          {/* {!!onAddReaction && !message.isUser && (
            <button
              ref={reactionButtonRef}
              onClick={() => setShowReactionMenu(!showReactionMenu)}
              className="text-xs opacity-0 cursor-pointer group-hover:opacity-70 hover:opacity-100 p-1 h-6 w-6 flex items-center justify-center rounded-full bg-background/80 transition-opacity"
              aria-label="Add reaction"
            >
              <Smile size={14} />
            </button>
          )} */}
        </div>

        {/* Reaction menu */}
        {showReactionMenu && !!onAddReaction && (
          <div
            ref={reactionMenuRef}
            className={`absolute z-10 -top-5 bg-popover shadow-md rounded-full py-1 px-2 flex items-center gap-1 animate-in slide-in-from-bottom-2 duration-200
            ${message.isUser ? "right-20" : "right-15"}`}
          >
            {DEFAULT_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReactionClick(emoji)}
                className={`text-lg hover:scale-125 cursor-pointer transition-transform p-1 rounded-full ${
                  userReaction === emoji ? "bg-primary/20 border-2 border-foreground" : ""
                }`}
              >
                {emoji}
              </button>
            ))}
            <div className="w-px h-5 bg-border mx-1"></div>
            <button
              onClick={() => {
                setShowFullEmojiPicker(true);
                setShowReactionMenu(false);
              }}
              className="text-lg cursor-pointer hover:scale-125 transition-transform p-1"
            >
              +
            </button>
          </div>
        )}

        {/* Full emoji picker */}
        {showFullEmojiPicker && onAddReaction && (
          <div
            ref={emojiPickerRef}
            className="absolute z-20 animate-in zoom-in-90 duration-200"
            style={{
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
              top: "100%",
              marginTop: "8px",
              ...(message.isUser ? { right: "0" } : { left: "0" }),
            }}
          >
            <EmojiPicker
              onEmojiClick={handleEmojiSelect}
              width={300}
              height={400}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
