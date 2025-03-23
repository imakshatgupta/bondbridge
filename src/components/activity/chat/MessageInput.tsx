import React, { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import QuickSuggestions from "./QuickSuggestions";

interface MessageInputProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  handleSendMessage: () => void;
  handleTyping: () => void;
  showSuggestions: boolean;
  suggestions: string[];
  loadingSuggestions: boolean;
  disabled?: boolean;
  disabledMessage?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
  newMessage,
  setNewMessage,
  handleSendMessage,
  handleTyping,
  showSuggestions,
  suggestions,
  loadingSuggestions,
  disabled = false,
  disabledMessage = "Type Your Message Here..."
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSuggestionClick = (suggestion: string) => {
    setNewMessage(suggestion);
    // Focus the input field after setting the message
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  return (
    <div className="p-3">
      {/* Quick suggestion section */}
      {showSuggestions && (
        <QuickSuggestions
          suggestions={suggestions}
          loadingSuggestions={loadingSuggestions}
          onSuggestionClick={handleSuggestionClick}
        />
      )}

      {/* Input field */}
      <div className="flex items-center gap-2 py-3">
        <Input
          ref={inputRef}
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            handleTyping();
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder={disabled ? disabledMessage : "Type Your Message Here..."}
          className="flex-1"
          disabled={disabled}
        />
        <Button
          onClick={handleSendMessage}
          disabled={!newMessage.trim() || disabled}
          className="bg-primary text-primary-foreground rounded-full"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </Button>
      </div>
    </div>
  );
};

export default MessageInput; 