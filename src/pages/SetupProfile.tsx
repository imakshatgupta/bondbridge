import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PersonalInfoTab from "@/components/profile/PersonalInfoTab";
import SkillsInterestsTab from "@/components/profile/SkillsInterestsTab";
import SelectAvatarTab from "@/components/profile/SelectAvatarTab";
import CoverProfilePhotosTab from "@/components/profile/CoverProfilePhotosTab";
import SelectCommunitiesTab from "@/components/profile/SelectCommunitiesTab";
import TabPageLayout from "@/components/layouts/TabPageLayout";

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

  const handleNext = () => {
    const currentIndex = tabs.findIndex((tab) => tab.id === currentTab);
    if (currentIndex < tabs.length - 1) {
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

  return (
    <TabPageLayout
      title="Complete Your Profile"
      tabs={tabs}
      currentTab={currentTab}
      onNext={handleNext}
      onBack={handleBack}
      decorativeImages={{
        clipboard: "/profile/clipboard.png",
        deco1: "/profile/deco1.png",
        deco2: "/profile/deco2.png",
      }}
    >
      {currentTab === "personal" && <PersonalInfoTab />}
      {currentTab === "skills" && <SkillsInterestsTab />}
      {currentTab === "avatar" && <SelectAvatarTab />}
      {currentTab === "photos" && <CoverProfilePhotosTab />}
      {currentTab === "communities" && <SelectCommunitiesTab />}
    </TabPageLayout>
  );
};

export default SetupProfile;
