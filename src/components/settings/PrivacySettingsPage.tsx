import React, { useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store";
import { setSettingsActive } from "@/store/settingsSlice";
import { updateCurrentUser } from "@/store/currentUserSlice";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Lock, Globe } from "lucide-react";
import { toast } from "sonner";
import { useApiCall } from "@/apis/globalCatchError";
import { updateUserProfile } from "@/apis/commonApiCalls/profileApi";

const PrivacySettingsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    username,
    email,
    bio,
    interests,
    privacyLevel,
    public: isPublic,
  } = useAppSelector((state) => state.currentUser);

  // Convert public value to boolean for switch (1 = public/true, 0 = private/false)
  const [isAccountPublic, setIsAccountPublic] = useState(isPublic === 1);

  // Use the API call hook for profile updates
  const [executeUpdateProfile, isUpdatingProfile] =
    useApiCall(updateUserProfile);

  const handleCloseSettings = () => {
    dispatch(setSettingsActive(false));
  };

  const handleTogglePublic = async (checked: boolean) => {
    setIsAccountPublic(checked);

    // Prepare the request data (reusing the same API as EditProfilePage)
    const profileData = {
      name: username,
      email: email,
      interests: interests,
      privacyLevel: privacyLevel ?? 0,
      bio: bio || "",
      public: checked ? 1 : 0, // Toggle public value (1 = public, 0 = private)
    };

    const { data, success } = await executeUpdateProfile(profileData);

    if (success && data) {
      // Update Redux store
      dispatch(
        updateCurrentUser({
          public: checked ? 1 : 0,
        })
      );

      toast.success(`Your account is now ${checked ? "public" : "private"}`);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">
        <ArrowLeft
          className="h-4 w-4 mr-2 inline cursor-pointer"
          onClick={handleCloseSettings}
        />
        Privacy Settings
      </h3>

      <div className="space-y-6">
        {/* Account Privacy Setting */}
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="account-privacy" className="text-base">
              Account Privacy
            </Label>
            <p className="text-sm text-muted-foreground">
              Choose whether your account is public or private. Public account
              posts are visible on everyone's feed.
            </p>

            <div className="flex items-center justify-between border rounded-lg p-4 mt-2">
              <div className="flex items-center space-x-3">
                {isAccountPublic ? (
                  <Globe className="h-5 w-5 text-primary" />
                ) : (
                  <Lock className="h-5 w-5 text-primary" />
                )}
                <div>
                  <p className="font-medium">
                    {isAccountPublic ? "Public Account" : "Private Account"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isAccountPublic
                      ? "Anyone can see your profile and follow you"
                      : "Only approved followers can see your content"}
                  </p>
                </div>
              </div>

              <Switch
                id="account-privacy"
                checked={isAccountPublic}
                onCheckedChange={handleTogglePublic}
                disabled={isUpdatingProfile}
              />
            </div>
          </div>
        </div>

        {/* Additional privacy info */}
        {/* <div className="rounded-lg border p-4 bg-muted/30">
          <h4 className="font-medium mb-2">Privacy Information</h4>
          <p className="text-sm text-muted-foreground">
            When your account is private:
          </p>
          <ul className="list-disc pl-5 mt-2 text-sm text-muted-foreground space-y-1">
            <li>New followers will need your approval</li>
            <li>Only approved followers can see your posts</li>
            <li>Direct messages are still available to people you follow</li>
            <li>Your profile info can still be discovered in search results</li>
          </ul>
        </div> */}

        {/* Show current state with disabled button */}
        <Button variant="outline" className="w-full" disabled={true}>
          {isUpdatingProfile
            ? "Updating..."
            : `Your account is currently ${
                isAccountPublic ? "public" : "private"
              }`}
        </Button>
      </div>
    </div>
  );
};

export default PrivacySettingsPage;
