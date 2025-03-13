import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import GroupInfoTab from "@/components/groups/GroupInfoTab";
import SelectFriendsTab from "@/components/groups/SelectFriendsTab";
import TabPageLayout from "@/components/layouts/TabPageLayout";
import SkillsInterestsTab from "@/components/profile/SkillsInterestsTab";
import { RootState } from "@/store";
import axios from "axios";
import { TYPING_TIME } from "@/lib/constants";
import { tabs } from "@/types/create_group";


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

  const lastPage = currentTab === tabs[tabs.length - 1].id;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Validate required fields
      if (!name) {
        throw new Error('Group name is required');
      }

      // Create form data for multipart/form-data submission (needed for file upload)
      const formData = new FormData();
      formData.append('name', name);
      
      if (description) {
        formData.append('description', description);
      }
      
      // Add skills if selected
      if (skillSelected.length > 0) {
        formData.append('skills', JSON.stringify(skillSelected));
      }
      
      // Add image if selected
      if (image instanceof File) {
        formData.append('image', image);
      }

      // Get token from localStorage
      const token = localStorage.getItem('token') || '';

      // Send API request to create group
      // const response = await axios.post(`${API_BASE_URL}/create-group`, formData, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data',
      //     'userid': userId,
      //     'token': token
      //   }
      // });

      const response = {
        data:{
          success: true,
          message: "Group created successfully",
          payload:{
            id: "123",
            name: name,
            description: description,
            skills: skillSelected,
            image: image,
            members: selectedFriends
          }
        }
      }

      if (response.data.success) {
        setSubmitSuccess(true);
        console.log("Group created successfully:", response.data);
        
        setTimeout(() => {
          navigate('/activity');
        }, TYPING_TIME);
      } else {
        throw new Error(response.data.message || 'Failed to create group');
      }
    } catch (error) {
      console.error("Group creation failed:", error);
      if (axios.isAxiosError(error)) {
        setSubmitError(error.response?.data?.message || error.message);
      } else {
        setSubmitError((error as Error).message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TabPageLayout
      title="Create Group"
      tabs={tabs}
      currentTab={currentTab}
      onNext={lastPage ? handleSubmit : handleNext}
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

      {/* Show submission status for the last tab */}
      {lastPage && (
        <div className="mt-4">
          {isSubmitting && <p className="text-center text-gray-600">Creating group...</p>}
          {submitError && <p className="text-center text-red-500">{submitError}</p>}
          {submitSuccess && <p className="text-center text-green-500">Group created successfully!</p>}
        </div>
      )}
    </TabPageLayout>
  );
};

export default CreateGroup;