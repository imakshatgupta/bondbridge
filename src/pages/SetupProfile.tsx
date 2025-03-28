import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PersonalInfoTab from "@/components/profile/PersonalInfoTab";
import SkillsInterestsTab from "@/components/profile/SkillsInterestsTab";
import SelectAvatarTab from "@/components/profile/SelectAvatarTab";
import CoverProfilePhotosTab from "@/components/profile/CoverProfilePhotosTab";
import SelectCommunitiesTab from "@/components/profile/SelectCommunitiesTab";
import TabPageLayout from "@/components/layouts/TabPageLayout";
import { useAppSelector } from "../store";
import { submitProfile } from "../apis/commonApiCalls/createProfileApi";
import { setPassword } from "../apis/commonApiCalls/authenticationApi";
import { joinMultipleCommunities } from "../apis/commonApiCalls/communitiesApi";
import { useApiCall } from "../apis/globalCatchError";

const tabs = [
  { id: "personal", label: "Personal Information" },
  { id: "skills", label: "Skills/Interests" },
  { id: "avatar", label: "Select Avatar" },
  { id: "photos", label: "Cover & Profile Photos" },
  { id: "communities", label: "Select Communities" },
];

const SetupProfile: React.FC = () => {
  const location = useLocation();
  const currentTab = location.hash.replace("#", "") || "personal";
  const navigate = useNavigate();

  // Get profile data from Redux store
  const {
    name,
    email,
    dateOfBirth,
    password,
    skillSelected,
    avatar,
    image,
    communitiesSelected
  } = useAppSelector(state => state.createProfile);

  // Use our custom hooks for API calls
  const [executeSubmit] = useApiCall(submitProfile);
  const [executeSetPassword] = useApiCall(setPassword);
  const [executeJoinCommunities] = useApiCall(joinMultipleCommunities);

  // Handle form submission
  const handleSubmit = async () => {
    // First submit the profile
    const result = await executeSubmit({
      name,
      email,
      dateOfBirth,
      password,
      skillSelected,
      image: image || undefined,
      avatar: avatar || undefined,
    });
    
    if (result.success && result.data) {
      console.log(result.data);
      
      // Now set the password
      const passwordResult = await executeSetPassword({
        password
      });
      
      if (passwordResult.success) {
        // Join selected communities if any are selected
        if (communitiesSelected.length > 0) {
          // Extract community IDs from the selected communities
          const communityIds = communitiesSelected.map(community => community.id);
          
          const joinResult = await executeJoinCommunities(communityIds);
          
          if (joinResult.success) {
            console.log("Successfully joined communities");
          } else {
            console.error("Failed to join some communities");
          }
        }
        
        // Navigate to home page regardless of community join status
        navigate('/');
      }
    }
  };

  const handleNext = () => {
    const currentIndex = tabs.findIndex((tab) => tab.id === currentTab);
    
    // If on the last tab (communities), submit the form instead of navigating
    if (currentIndex === tabs.length - 1) {
      handleSubmit();
    } else if (currentIndex < tabs.length - 1) {
      // Otherwise, navigate to the next tab
      navigate(`#${tabs[currentIndex + 1].id}`);
    }
  };

  const handleBack = () => {
    const currentIndex = tabs.findIndex((tab) => tab.id === currentTab);
    if (currentIndex > 0) {
      navigate(`#${tabs[currentIndex - 1].id}`);
    } else {
      navigate(-1);
    }
  };

  // Check if we're on the last tab
  const isLastTab = currentTab === tabs[tabs.length - 1].id;

  return (
    <div className="max-h-screen overflow-auto">
      <TabPageLayout
        title="Complete Your Profile"
        tabs={tabs}
        currentTab={currentTab}
        onNext={isLastTab ? handleSubmit : handleNext}
        onBack={handleBack}
        decorativeImages={{
          clipboard: "/profile/clipboard.png",
          deco1: "/profile/deco1.png",
          deco2: "/profile/deco2.png",
        }}
      >
        {/* Render tab content */}
        {currentTab === "personal" && <PersonalInfoTab />}
        {currentTab === "skills" && <SkillsInterestsTab />}
        {currentTab === "avatar" && <SelectAvatarTab />}
        {currentTab === "photos" && <CoverProfilePhotosTab />}
        {currentTab === "communities" && <SelectCommunitiesTab />}
      </TabPageLayout>
    </div>
  );
};

export default SetupProfile;
