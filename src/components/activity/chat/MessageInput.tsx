import React, { useRef, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import QuickSuggestions from "./QuickSuggestions";
import { Mic } from "lucide-react";
import { 
  SpeechRecognition, 
  SpeechRecognitionEvent, 
  SpeechRecognitionErrorEvent, 
  registerRecognitionInstance,
  unregisterRecognitionInstance
} from "@/types/speech-recognition";

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
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  // Cleanup effect to stop speech recognition when component unmounts
  useEffect(() => {
    // This cleanup function runs when the component unmounts
    return () => {
      if (recognition) {
        try {
          recognition.stop();
          setIsListening(false);
        } catch (error) {
          console.error('Error stopping speech recognition on unmount:', error);
        }
      }
    };
  }, [recognition]);

  const handleSuggestionClick = (suggestion: string) => {
    setNewMessage(suggestion);
    // Focus the input field after setting the message
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const startSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Speech recognition is not supported in your browser");
      return;
    }

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognitionAPI();
    
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = 'en-US';
    
    recognitionInstance.onstart = () => {
      setIsListening(true);
      // Register this instance in our tracker
      registerRecognitionInstance(recognitionInstance);
    };
    
    recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      
      setNewMessage(transcript);
      handleTyping();
    };
    
    recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error', event.error);
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
          onClick={toggleSpeechRecognition}
          disabled={disabled}
          variant="ghost"
          className="p-2 hover:bg-muted rounded-full"
          type="button"
          aria-label={isListening ? "Stop dictation" : "Start dictation"}
        >
          {isListening ? (
            <Mic size={20} className="text-primary animate-pulse" />
          ) : (
            <Mic size={20} className="text-[var(--foreground)]" />
          )}
        </Button>
        
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