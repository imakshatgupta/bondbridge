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
import { fetchCommunityById } from "@/apis/commonApiCalls/communitiesApi";
import { CommunityResponse } from "@/apis/apiTypes/communitiesTypes";

const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const location = useLocation();
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [userCommunityDetails, setUserCommunityDetails] = useState<CommunityResponse[]>([]);
  const [executeProfileFetch, isLoading] = useApiCall(fetchUserProfile);
  const [executeAddToSearchHistory] = useApiCall(addToSearchHistory);
  const [executeFetchCommunity] = useApiCall(fetchCommunityById);
  const [loadingCommunities, setLoadingCommunities] = useState(false);
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
  }, [userId, currentUserId]); // Added currentUserId to dependency list

  // Fetch community details for each community the user is part of
  useEffect(() => {
    const fetchUserCommunities = async () => {
      if (!userData?.communities || userData.communities.length === 0) {
        setUserCommunityDetails([]);
        return;
      }

      setLoadingCommunities(true);
      
      // Fetch data for each community in parallel using Promise.all
      const communityPromises = userData.communities.map(communityId => 
        executeFetchCommunity(communityId)
          .then(result => result.success && result.data ? result.data : null)
      );

      const communities = await Promise.all(communityPromises);
      // Filter out any failed requests (null values)
      setUserCommunityDetails(communities.filter(community => community !== null) as CommunityResponse[]);
      setLoadingCommunities(false);
    };

    fetchUserCommunities();
  }, [userData?.communities]);

  if (isLoading || loadingCommunities) {
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

  // Extract just the community IDs to pass to the Profile component
  // This maintains compatibility with the existing Profile component
  const communityIds = userCommunityDetails.map(community => community._id);

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
        communities={communityIds} // Pass just the IDs to keep the existing interface
        interests={userData.interests}
        public={userData.public}
      />
    </>
  );
};

export default ProfilePage;