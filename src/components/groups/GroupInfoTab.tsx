import React, { useRef, useState, useEffect } from "react";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Smile } from "lucide-react";
import EmojiPicker from "emoji-picker-react";

interface GroupInfo {
  name: string;
  description: string;
  image?: File | null;
}

interface GroupInfoTabProps {
  groupInfo: GroupInfo;
  onChange: (info: GroupInfo) => void;
  onValidationChange?: (isValid: boolean) => void;
}

const GroupInfoTab: React.FC<GroupInfoTabProps> = ({ groupInfo, onChange, onValidationChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);

  // Handle clicks outside the emoji picker
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

  // Handle emoji selection
  const handleEmojiSelect = (emojiData: any) => {
    onChange({
      ...groupInfo,
      description: groupInfo.description + emojiData.emoji
    });
  };

  // Validate required fields and update parent component
  useEffect(() => {
    const isNameValid = groupInfo.name.trim().length > 0;
    const isDescriptionValid = groupInfo.description.trim().length > 0;
    const isValid = isNameValid && isDescriptionValid;
    
    if (onValidationChange) {
      onValidationChange(isValid);
    }
  }, [groupInfo.name, groupInfo.description, onValidationChange]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Create a preview URL for the selected image
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Store the File object directly
    onChange({ ...groupInfo, image: file });
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="photo" className="text-center block">
          Group Photo
        </Label>
        <div className="flex justify-center mb-4">
          <div className="relative w-24 h-24 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
            {previewUrl && (
              <img 
                src={previewUrl} 
                alt="Group image" 
                className="h-full w-full object-cover"
              />
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
              id="group-image-upload"
            />
            <button 
              className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors cursor-pointer"
              onClick={handleButtonClick}
              type="button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="groupName" className="text-sm font-medium">
          Group Name <span className="text-destructive -ml-1">*</span>
        </label>
        <Input
          id="groupName"
          placeholder="Enter Group Name"
          value={groupInfo.name}
          onChange={(e) => onChange({ ...groupInfo, name: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description <span className="text-destructive -ml-1">*</span>
        </label>
        <div className="relative">
          <Textarea
            id="description"
            placeholder="Describe Your Group..."
            value={groupInfo.description}
            onChange={(e) =>
              onChange({ ...groupInfo, description: e.target.value })
            }
            rows={4}
            className="pb-10"
          />
          <Button
            ref={emojiButtonRef}
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 bottom-2 cursor-pointer text-muted-foreground hover:text-foreground"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile className="h-5 w-5" />
          </Button>
          {showEmojiPicker && (
            <div 
              ref={emojiPickerRef}
              className="absolute right-0 bottom-14 z-50"
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
    </div>
  );
};

export default GroupInfoTab;