import * as React from "react"
import { cn } from "@/lib/utils"
import EmojiPicker, { EmojiClickData } from "emoji-picker-react"
import { Smile } from "lucide-react"
import { Button } from "./button"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  enableEmoji?: boolean;
  onEmojiSelect?: (emoji: string) => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, enableEmoji = true, onEmojiSelect, ...props }, ref) => {
    const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
    const emojiPickerRef = React.useRef<HTMLDivElement>(null);
    const emojiButtonRef = React.useRef<HTMLButtonElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);
    
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    React.useEffect(() => {
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

    const handleEmojiClick = (emojiData: EmojiClickData) => {
      if (onEmojiSelect) {
        onEmojiSelect(emojiData.emoji);
      } else if (inputRef.current) {
        // Get current cursor position
        const start = inputRef.current.selectionStart || 0;
        const end = inputRef.current.selectionEnd || 0;
        
        // Get current value
        const currentValue = inputRef.current.value;
        
        // Create new value with emoji inserted at cursor position
        const newValue = 
          currentValue.substring(0, start) + 
          emojiData.emoji + 
          currentValue.substring(end);
        
        // Trigger onChange event
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype, 
          "value"
        )?.set;
        
        if (nativeInputValueSetter) {
          nativeInputValueSetter.call(inputRef.current, newValue);
          const event = new Event('input', { bubbles: true });
          inputRef.current.dispatchEvent(event);
          
          // Update cursor position to after the emoji
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.selectionStart = start + emojiData.emoji.length;
              inputRef.current.selectionEnd = start + emojiData.emoji.length;
              inputRef.current.focus();
            }
          }, 0);
        }
      }
      
      setShowEmojiPicker(false);
    };

    return (
      <div className="relative flex items-center w-full">
        <input
          type={type}
          data-slot="input"
          className={cn(
            "border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-full border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[1px]",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            enableEmoji ? "pr-10" : "",
            className
          )}
          ref={inputRef}
          {...props}
        />
        
        {enableEmoji && (
          <div className="absolute right-2">
            <Button
              ref={emojiButtonRef}
              variant="ghost"
              size="icon"
              type="button"
              className="h-7 w-7 p-0 cursor-pointer"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile className="h-4 w-4" />
            </Button>
            
            {showEmojiPicker && (
              <div
                ref={emojiPickerRef}
                className="absolute bottom-10 right-0 z-50"
              >
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  width={280}
                  height={350}
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input }
