import React, { useRef, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import QuickSuggestions from "./QuickSuggestions";
import { Mic, Smile, CornerUpLeft, X } from "lucide-react";
import {
  SpeechRecognition,
  SpeechRecognitionEvent,
  SpeechRecognitionErrorEvent,
  registerRecognitionInstance,
  unregisterRecognitionInstance,
} from "@/types/speech-recognition";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { Message } from "@/store/chatSlice";

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
  replyToMessage?: Message | null;
  onCancelReply?: () => void;
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
  disabledMessage = "Type Your Message Here...",
  replyToMessage = null,
  onCancelReply,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(
    null
  );
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);

  // Cleanup effect to stop speech recognition when component unmounts
  useEffect(() => {
    // This cleanup function runs when the component unmounts
    return () => {
      if (recognition) {
        try {
          recognition.stop();
          setIsListening(false);
        } catch (error) {
          console.error("Error stopping speech recognition on unmount:", error);
        }
      }
    };
  }, [recognition]);

  // Add click outside handler for emoji picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showEmojiPicker &&
        emojiPickerRef.current &&
        emojiButtonRef.current &&
        !emojiPickerRef.current.contains(event.target as Node) &&
        !emojiButtonRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Focus input when reply is selected
  useEffect(() => {
    if (replyToMessage && inputRef.current) {
      inputRef.current.focus();
    }
  }, [replyToMessage]);

  const handleSuggestionClick = (suggestion: string) => {
    setNewMessage(suggestion);
    // Focus the input field after setting the message
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const startSpeechRecognition = () => {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      alert("Speech recognition is not supported in your browser");
      return;
    }

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognitionAPI();

    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = "en-US";

    recognitionInstance.onstart = () => {
      setIsListening(true);
      // Register this instance in our tracker
      registerRecognitionInstance(recognitionInstance);
    };

    recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join("");

      setNewMessage(transcript);
      handleTyping();
    };

    recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
      unregisterRecognitionInstance(recognitionInstance);
    };

    recognitionInstance.onend = () => {
      setIsListening(false);
      unregisterRecognitionInstance(recognitionInstance);
    };

    setRecognition(recognitionInstance);
    recognitionInstance.start();
  };

  const stopSpeechRecognition = () => {
    if (recognition) {
      recognition.stop();
      setRecognition(null);
      setIsListening(false);
      unregisterRecognitionInstance(recognition);
    }
  };

  const toggleSpeechRecognition = () => {
    if (isListening) {
      stopSpeechRecognition();
    } else {
      startSpeechRecognition();
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    // Get current value
    const currentValue = newMessage;

    // If input has focus, use cursor position, otherwise append to end
    let start = 0;
    let end = 0;

    if (inputRef.current) {
      start = inputRef.current.selectionStart || currentValue.length;
      end = inputRef.current.selectionEnd || currentValue.length;
    } else {
      start = currentValue.length;
      end = currentValue.length;
    }

    // Create new value with emoji inserted at cursor position
    const newValue =
      currentValue.substring(0, start) +
      emojiData.emoji +
      currentValue.substring(end);

    // Update message state
    setNewMessage(newValue);

    // Call typing handler
    handleTyping();

    // Focus the input and set cursor position after emoji
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.selectionStart = start + emojiData.emoji.length;
        inputRef.current.selectionEnd = start + emojiData.emoji.length;
      }
    }, 0);

    setShowEmojiPicker(false);
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

      {/* Reply indicator */}
      {replyToMessage && onCancelReply && (
        <div className="flex items-center justify-between border-l-4 border-primary/70 bg-primary/10 p-2 px-3 rounded-r-md mb-2">
          <div className="flex items-center gap-2">
            <CornerUpLeft size={16} className="text-primary/80" />
            <div className="flex flex-col">
              <span className="text-xs font-medium text-muted-foreground">
                {replyToMessage.isUser
                  ? "Replying to yourself"
                  : `Replying to ${replyToMessage.senderName || "Unknown"}`}
              </span>
              <span className="text-xs text-foreground line-clamp-1">
                {typeof replyToMessage.text === "string"
                  ? replyToMessage.text
                  : "Shared content"}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full hover:bg-destructive/10 cursor-pointer"
            onClick={onCancelReply}
          >
            <X size={14} />
          </Button>
        </div>
      )}

      {/* Input field */}
      <div className="flex items-center gap-2 py-3">
        <div className="flex-1 flex items-center gap-2 bg-muted/50 rounded-full px-4 py-2 relative">
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder={
              disabled ? disabledMessage : "Type Your Message Here..."
            }
            className="flex-1 border-0 bg-transparent rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
            disabled={disabled}
          />

          <div className="relative">
            <Button
              ref={emojiButtonRef}
              variant="ghost"
              size="icon"
              type="button"
              className="h-7 w-7 p-0 cursor-pointer text-muted-foreground/60"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              disabled={disabled}
            >
              <Smile className="h-4 w-4" />
            </Button>

            {showEmojiPicker && (
              <div
                ref={emojiPickerRef}
                className="absolute bottom-12 right-0 z-[100]"
                style={{ boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)" }}
              >
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  width={280}
                  height={350}
                />
              </div>
            )}
          </div>

          <Button
            onClick={toggleSpeechRecognition}
            disabled={disabled}
            variant="ghost"
            size="icon"
            className="p-0 h-6 w-6 rounded-full cursor-pointer"
            type="button"
            aria-label={isListening ? "Stop dictation" : "Start dictation"}
          >
            {isListening ? (
              <Mic size={20} className="text-primary animate-pulse" />
            ) : (
              <Mic size={20} className="text-muted-foreground/60" />
            )}
          </Button>
        </div>

        <Button
          onClick={handleSendMessage}
          disabled={!newMessage.trim() || disabled}
          className="bg-primary text-primary-foreground rounded-full h-11 w-11 aspect-square cursor-pointer"
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
