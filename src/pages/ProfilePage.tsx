import React, { useEffect, useState } from "react";
import Profile from "@/components/Profile";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { fetchUserProfile } from "@/apis/commonApiCalls/profileApi";
import type { UserProfileData } from "@/apis/apiTypes/profileTypes";

const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUserId = "1"; // Mock logged-in user ID
    setIsLoading(true); // Set loading to true when userId changes
    setUserData(null); // Clear previous user data

    const loadUserData = async () => {
      try {
        if (!userId) return;
        const response = await fetchUserProfile(userId, currentUserId);
        if (response.success) {
          setUserData(response.data);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="h-[80vh] w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!userData || !userId) {
    return (
      <div className="h-[80vh] w-full flex items-center justify-center text-muted-foreground">
        User not found
      </div>
    );
  }

  return (
    <Profile
      userId={userId}
      username={userData.username}
      email={userData.email}
      followers={userData.followers}
      following={userData.following}
      avatarSrc={userData.avatarSrc}
      isCurrentUser={userData.isCurrentUser}
    />
  );
};

export default ProfilePage;
