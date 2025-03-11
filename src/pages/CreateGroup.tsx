import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import GroupInfoTab from "@/components/groups/GroupInfoTab";
import SelectFriendsTab from "@/components/groups/SelectFriendsTab";
import TabPageLayout from "@/components/layouts/TabPageLayout";
import SkillsInterestsTab from "@/components/profile/SkillsInterestsTab";

const tabs = [
  { id: "info", label: "Group Information" },
  { id: "skills", label: "Skills/Interests" },
  { id: "friends", label: "Select friends" },
];

const CreateGroup: React.FC = () => {
  const location = useLocation();
  const currentTab = location.hash.replace("#", "") || "info";
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
      title="Create Group"
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
      {currentTab === "info" && <GroupInfoTab />}
      {currentTab === "skills" && <SkillsInterestsTab />}
      {currentTab === "friends" && <SelectFriendsTab />}
    </TabPageLayout>
  );
};

export default CreateGroup; 