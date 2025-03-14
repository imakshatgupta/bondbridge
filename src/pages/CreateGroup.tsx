import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import GroupInfoTab from "@/components/groups/GroupInfoTab";
import SelectFriendsTab from "@/components/groups/SelectFriendsTab";
import TabPageLayout from "@/components/layouts/TabPageLayout";
import SkillsInterestsTab from "@/components/profile/SkillsInterestsTab";
import { useApiCall } from "@/apis/globalCatchError";
import { createGroup } from "@/apis/commonApiCalls/activityApi";
import { toast } from "sonner";

interface GroupInfo {
  name: string;
  description: string;
}

interface GroupSkills {
  skills: string[];
  interests: string[];
}


const CreateGroup: React.FC = () => {
  const location = useLocation();
  const currentTab = location.hash.replace("#", "") || "info";
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

  // Get group data from Redux store
  const { name, description, skillSelected, image, selectedFriends } = useSelector(
    (state: RootState) => state.createGroup
  );
  
  // Get user ID from profile state for authorization
  const { userId } = useSelector((state: RootState) => state.createProfile);

  // State management for each tab
  const [groupInfo, setGroupInfo] = useState<GroupInfo>({
    name: "",
    description: "",
  });
  const [groupSkills, setGroupSkills] = useState<GroupSkills>({
    skills: [],
    interests: [],
  });
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    []
  );

  const [executeCreateGroup, isCreatingGroup] = useApiCall(createGroup);

  const handleNext = async () => {
    const currentIndex = tabs.findIndex((tab) => tab.id === currentTab);

    console.log("Current Index: ", currentIndex, tabs.length);

    // If we're on the last tab and clicking next, create the group
    if (currentIndex === tabs.length - 1) {
      if (!groupInfo.name.trim()) {
        toast.error("Please provide a group name");
        navigate("#info");
        return;
      }

      if (selectedParticipants.length < 1) {
        toast.error("Please select at least one friend to create a group");
        return;
      }

      const result = await executeCreateGroup({
        groupName: groupInfo.name,
        participants: selectedParticipants,
      });

      if (result.success) {
        toast.success("Group created successfully!");
        navigate("/activity");
      }
      return;
    }

    // Otherwise, proceed to next tab
    navigate(`#${tabs[currentIndex + 1].id}`);
  };

  const handleBack = () => {
    const currentIndex = tabs.findIndex((tab) => tab.id === currentTab);
    if (currentIndex > 0) {
      navigate(`#${tabs[currentIndex - 1].id}`);
    } else {
      navigate(-1);
    }
  };

  const isLastTab = currentTab === tabs[tabs.length - 1].id;

  return (
    <TabPageLayout
      title="Create Group"
      tabs={tabs}
      currentTab={currentTab}
      onNext={lastPage ? handleSubmit : handleNext}
      onBack={handleBack}
      nextButtonText={isLastTab ? "Create" : "Next"}
      isNextLoading={isCreatingGroup}
      decorativeImages={{
        clipboard: "/profile/clipboard.png",
        deco1: "/profile/deco1.png",
        deco2: "/profile/deco2.png",
      }}
    >
      {currentTab === "info" && (
        <GroupInfoTab groupInfo={groupInfo} onChange={setGroupInfo} />
      )}
      {currentTab === "skills" && (
        <SkillsInterestsTab
          skills={groupSkills.skills}
          interests={groupSkills.interests}
          onSkillsChange={(skills: string[]) =>
            setGroupSkills((prev) => ({ ...prev, skills }))
          }
          onInterestsChange={(interests: string[]) =>
            setGroupSkills((prev) => ({ ...prev, interests }))
          }
        />
      )}
      {currentTab === "friends" && (
        <SelectFriendsTab
          selectedParticipants={selectedParticipants}
          onParticipantsChange={setSelectedParticipants}
        />
      )}
    </TabPageLayout>
  );
};

export default CreateGroup;
