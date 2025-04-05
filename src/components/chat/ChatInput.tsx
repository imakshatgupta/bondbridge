import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { ArrowRight, Mic } from 'lucide-react';
import { 
  SpeechRecognition, 
  SpeechRecognitionEvent, 
  SpeechRecognitionErrorEvent,
  registerRecognitionInstance,
  unregisterRecognitionInstance 
} from '@/types/speech-recognition';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  isAudioPlaying?: boolean;
  expectAudioAfterSend?: boolean;
  onSpeechStateChange?: (isActive: boolean) => void;
}

export interface ChatInputRef {
  forceStopListening: () => void;
}

export const ChatInput = forwardRef<ChatInputRef, ChatInputProps>(({ 
  onSendMessage, 
  placeholder = 'Type your message...', 
  disabled = false,
  isAudioPlaying = false,
  expectAudioAfterSend = false,
  onSpeechStateChange
}, ref) => {
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [wasListeningBeforeAudio, setWasListeningBeforeAudio] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const recognitionActiveRef = useRef(false);
  const messageWasSentRef = useRef(false);

  // Helper function to safely start recognition
  const safelyStartRecognition = (rec: SpeechRecognition) => {
    if (recognitionActiveRef.current) {
      console.log('Recognition already active, not starting again');
      return;
    }
    
    try {
      rec.start();
      registerRecognitionInstance(rec);
      recognitionActiveRef.current = true;
      if (onSpeechStateChange) onSpeechStateChange(true);
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      recognitionActiveRef.current = false;
      setIsListening(false);
      if (onSpeechStateChange) onSpeechStateChange(false);
    }
  };

  // Helper function to safely stop recognition
  const safelyStopRecognition = (rec: SpeechRecognition) => {
    if (!recognitionActiveRef.current) {
      console.log('Recognition not active, nothing to stop');
      return;
    }
    
    try {
      rec.stop();
      unregisterRecognitionInstance(rec);
      // We don't set recognitionActiveRef to false here because
      // that will happen in the onend handler
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
      recognitionActiveRef.current = false;
      if (onSpeechStateChange) onSpeechStateChange(false);
    }
  };

  // Method to force stop listening that can be called from parent
  const forceStopListening = () => {
    if (recognition) {
      safelyStopRecognition(recognition);
    }
    setIsListening(false);
    setWasListeningBeforeAudio(false);
    recognitionActiveRef.current = false;
    if (onSpeechStateChange) onSpeechStateChange(false);
  };

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    forceStopListening
  }));

  // Initialize speech recognition on component mount
  useEffect(() => {
    // Get the correct Speech Recognition API based on browser
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      console.error('Speech recognition not supported by this browser');
      return;
    }
    
    const recognitionInstance = new SpeechRecognitionAPI();
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = 'en-US';
    
    recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      
      setMessage(transcript);
    };
    
    recognitionInstance.onend = () => {
      // Recognition has ended, update our active flag
      recognitionActiveRef.current = false;
      unregisterRecognitionInstance(recognitionInstance);
      if (onSpeechStateChange) onSpeechStateChange(false);
      
      if (isListening && !isAudioPlaying) {
        if (message.trim()) {
          // Set the flag that we're sending a message by auto-detection
          messageWasSentRef.current = true;
          
          // Send the message
          onSendMessage(message);
          setMessage('');
          
          // Only store listening state if we expect audio
          if (expectAudioAfterSend) {
            setWasListeningBeforeAudio(true);
            // Don't restart recognition - it will be restarted when audio finishes
            return;
          }
          // For normal messages without audio, we will restart below
        }
        
        if (recognitionInstance) {
          setTimeout(() => {
            if (isListening && !isAudioPlaying && !recognitionActiveRef.current) {
              safelyStartRecognition(recognitionInstance);
              // Reset the flag as we're restarting recognition
              messageWasSentRef.current = false;
            }
          }, 100);
        }
      }
    };
    
    recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error', event.error);
      recognitionActiveRef.current = false;
      setIsListening(false);
      if (onSpeechStateChange) onSpeechStateChange(false);
    };
    
    setRecognition(recognitionInstance);
    
    // Cleanup function
    return () => {
      if (recognition && recognitionActiveRef.current) {
        try {
          recognition.stop();
          recognitionActiveRef.current = false;
          setIsListening(false);
          if (onSpeechStateChange) onSpeechStateChange(false);
        } catch (error) {
          console.error('Error stopping speech recognition on unmount:', error);
        }
      }
    };
  }, []);

  // Update the useEffect to have dependencies for message and onSendMessage
  useEffect(() => {
    if (recognition) {
      recognition.onend = () => {
        // Recognition has ended, update our active flag
        recognitionActiveRef.current = false;
        if (onSpeechStateChange) onSpeechStateChange(false);
        
        if (isListening && !isAudioPlaying) {
          if (message.trim()) {
            // Set the flag that we're sending a message by auto-detection
            messageWasSentRef.current = true;
            
            // Send the message
            onSendMessage(message);
            setMessage('');
            
            // Only store listening state if we expect audio
            if (expectAudioAfterSend) {
              setWasListeningBeforeAudio(true);
              // Don't restart recognition - it will be restarted when audio finishes
              return;
            }
            // For normal messages without audio, we will restart below
          }
          
          setTimeout(() => {
            if (isListening && !isAudioPlaying && !recognitionActiveRef.current) {
              safelyStartRecognition(recognition);
              // Reset the flag as we're restarting recognition
              messageWasSentRef.current = false;
            }
          }, 100);
        } else {
          setIsListening(false);
        }
      };
    }
  }, [recognition, isListening, message, onSendMessage, isAudioPlaying, expectAudioAfterSend, onSpeechStateChange]);

  // Effect to handle audio playback state changes
  useEffect(() => {
    if (!recognition) return;
    
    if (isAudioPlaying) {
      // If we're starting to play audio and currently listening
      if (isListening) {
        setWasListeningBeforeAudio(true);
        safelyStopRecognition(recognition);
      }
    } else if (wasListeningBeforeAudio && !recognitionActiveRef.current) {
      // If audio stopped and we were listening before, and recognition isn't already active
      setIsListening(true);
      messageWasSentRef.current = false;
      safelyStartRecognition(recognition);
      setWasListeningBeforeAudio(false);
    }
  }, [isAudioPlaying, recognition, isListening]);

  const toggleListening = () => {
    if (!recognition || isAudioPlaying) return;
    
    if (isListening) {
      safelyStopRecognition(recognition);
      setIsListening(false);
      setWasListeningBeforeAudio(false);
    } else {
      setIsListening(true);
      messageWasSentRef.current = false;
      safelyStartRecognition(recognition);
    }
  };

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
      
      if (isListening && recognition) {
        // Always stop recognition first
        safelyStopRecognition(recognition);
        
        // If we're expecting audio to play after sending (TTS is on)
        if (expectAudioAfterSend) {
          // Set the flag to prevent auto-restart and remember that we were listening
          messageWasSentRef.current = true;
          setWasListeningBeforeAudio(true);
          // Don't restart - will be restarted when audio finishes
        } else if (!isAudioPlaying) {
          // For normal messages without audio, restart immediately
          setTimeout(() => {
            if (isListening && !isAudioPlaying && !recognitionActiveRef.current) {
              safelyStartRecognition(recognition);
              messageWasSentRef.current = false;
            }
          }, 100);
        }
      }
    }
  };

  return (
    <div className="p-3 flex items-center gap-2">
      <div className="flex-1 flex items-center gap-3 bg-muted/50 rounded-full px-4 py-2 relative">
        <Input 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !disabled && handleSend()}
          placeholder={isListening && !isAudioPlaying ? 'Listening...' : isAudioPlaying && wasListeningBeforeAudio ? 'Audio playing...' : placeholder}
          disabled={disabled}
          className="flex-1 border-0 bg-transparent rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
        />
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={toggleListening}
          disabled={disabled || isAudioPlaying}
          className={`p-0 h-6 w-6 rounded-full cursor-pointer ${
            isListening && !isAudioPlaying ? 'text-primary animate-pulse' : 
            isAudioPlaying && wasListeningBeforeAudio ? 'text-yellow-500' : 
            'text-muted-foreground/60'
          }`}
        >
          <Mic className="h-5 w-5" />
        </Button>
      </div>
      <Button 
        onClick={handleSend}
        disabled={!message.trim() || disabled}
        className="rounded-full aspect-square h-11 w-11 bg-primary cursor-pointer"
      >
        <ArrowRight className="h-full w-full" />
      </Button>
    </div>
  );
}); 