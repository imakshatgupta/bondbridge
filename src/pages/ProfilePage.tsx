import React, { useEffect, useState, useRef } from "react";
import Profile from "@/components/Profile";
import { useParams, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { fetchUserProfile } from "@/apis/commonApiCalls/profileApi";
import type { UserProfileData } from "@/apis/apiTypes/profileTypes";
import { useApiCall } from "@/apis/globalCatchError";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { addToSearchHistory } from "@/apis/commonApiCalls/searchHistoryApi";
import { toast } from "sonner";

const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const location = useLocation();
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [executeProfileFetch, isLoading] = useApiCall(fetchUserProfile);
  const [executeAddToSearchHistory] = useApiCall(addToSearchHistory);
  const hasAddedToHistory = useRef(false);
  
  // Get currentUserId from Redux store instead of localStorage
  const currentUserId = useSelector((state: RootState) => state.currentUser.userId);


  // Add to search history when profile is viewed from search results
  useEffect(() => {
    const addToHistory = async () => {
      const fromSearch = location.state?.fromSearch;
      if (!userId || userId === currentUserId || !fromSearch || hasAddedToHistory.current) return;
      
      hasAddedToHistory.current = true;
      const { success } = await executeAddToSearchHistory(userId);
      if (!success) {
        toast.error("Failed to add to search history");
        hasAddedToHistory.current = false; // Reset if failed
      }
    };
    
    addToHistory();
  }, [userId, currentUserId]); // Removed location.state from dependencies

  useEffect(() => {
    const loadUserData = async () => {
      if (!userId) return;
      
      // Use currentUserId from Redux instead of localStorage
      const result = await executeProfileFetch(userId, currentUserId);
      if (result.success && result.data) {
        setUserData(result.data.data);
      }
    };

    loadUserData();
  }, [userId,currentUserId]); // Added currentUserId to dependency list

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
    <>
      <Profile
        userId={userId}
        username={userData.username}
        // email={userData.email}
        bio={userData.bio}
        followers={userData.followers}
        following={userData.following}
        avatarSrc={userData.avatarSrc}
        profilePic={userData.profilePic}
        isCurrentUser={userData.isCurrentUser}
        isFollowing={userData.isFollowing}
        isFollower={userData.isFollower}
        requestSent={userData.requestSent}
        compatibility={userData.compatibility}
        communities={userData.communities}
        interests={userData.interests}
      />
    </>
  );
};

export default ProfilePage;