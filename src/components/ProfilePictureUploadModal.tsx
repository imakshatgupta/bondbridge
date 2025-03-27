import { useState, useRef, ChangeEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useApiCall } from "@/apis/globalCatchError";
import { updateUserProfile } from "@/apis/commonApiCalls/profileApi";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload } from "lucide-react";
import { useAppDispatch } from "@/store";
import { updateCurrentUser } from "@/store/currentUserSlice";

interface ProfilePictureUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar: string;
  username: string;
  privacyLevel: number;
  bio?: string;
}

export function ProfilePictureUploadModal({
  isOpen,
  onClose,
  currentAvatar,
  username,
  privacyLevel,
  bio,
}: ProfilePictureUploadModalProps) {
  const [previewUrl, setPreviewUrl] = useState<string>(currentAvatar);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();
  const [executeUpdateProfile] = useApiCall(updateUserProfile);

  // Handle file input change
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        processFile(file);
      } catch (error) {
        console.error("Error processing image:", error);
        toast.error("Failed to process the image");
      }
    }
  };

  // Process the file - store as File and create preview URL
  const processFile = (file: File) => {
    setSelectedFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target && e.target.result) {
        setPreviewUrl(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Trigger file input click
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error("Please select an image");
      return;
    }

    const profileData = {
      name: username,
      privacyLevel,
      avatar: currentAvatar,
      image: selectedFile,
      bio,
    };

    const result = await executeUpdateProfile(profileData);
    
    if (result.success && result.data) {
      toast.success("Profile picture updated successfully");
      if (result.data.user?.profilePic) {
        dispatch(updateCurrentUser({ profilePic: result.data.user.profilePic }));
      }
      onClose();
    } else {
      toast.error(result.data?.message || "Failed to update profile picture");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Profile Picture</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center space-y-4">
            <div 
              className="relative cursor-pointer"
              onClick={handleAvatarClick}
            >
              <Avatar className="h-32 w-32">
                <AvatarImage src={previewUrl} alt="Profile" />
                <AvatarFallback>
                  {username?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 bg-background rounded-full p-2 border shadow-sm">
                <Upload className="h-4 w-4" />
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <p className="text-sm text-muted-foreground">
              Click on the image to upload a new profile picture
            </p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 