import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import PersonalInfoTab from "@/components/profile/PersonalInfoTab";
import SkillsInterestsTab from "@/components/profile/SkillsInterestsTab";
import SelectAvatarTab from "@/components/profile/SelectAvatarTab";
import CoverProfilePhotosTab from "@/components/profile/CoverProfilePhotosTab";
import SelectCommunitiesTab from "@/components/profile/SelectCommunitiesTab";
import { useAppSelector, useAppDispatch } from "../store";
import { setUserId } from "@/store/createProfileSlice";
import axios from "axios";

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
  const dispatch = useAppDispatch();

  // Import the necessary hooks and functions from the store
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Get profile data from Redux store including userId
  const {
    userId,
    name,
    email,
    dateOfBirth,
    password,
    skillSelected,
    image,
    avatar,
    communitiesSelected
  } = useAppSelector(state => state.createProfile);

  console.log("userId: ", userId);

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const formData = new FormData();
      
      // Validate required fields
      if (!name || !email || !dateOfBirth || !password) {
        throw new Error('Please fill in all required fields');
      }

      // Add basic profile data
      formData.append('name', name);
      formData.append('email', email);
      formData.append('dateOfBirth', dateOfBirth);
      formData.append('password', password);
      
      // Add skills array
      if (skillSelected.length > 0) {
        formData.append('skills', JSON.stringify(skillSelected));
      }
      
      // Add image file if exists
      if (image instanceof File) {
        formData.append('image', image, image.name);
      }
      
      // Add avatar if exists
      if (avatar) {
        formData.append('avatar', avatar);
      }
      
      // Add selected communities
      if (communitiesSelected.length > 0) {
        formData.append('communities', JSON.stringify(communitiesSelected));
      }

      // Log formData contents for debugging
      for (const pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }
      
      // Use userId from Redux if available, otherwise don't include it
      const headers: Record<string, string> = {
        'Content-Type': 'multipart/form-data',
        'userId': userId,
      };
      
      console.log("userId: ", userId);

      const response = await axios.put('http://localhost:3000/api/edit-profile', formData, {
        headers,
      });
      
      if (response.data.success) {
        console.log("Profile creation successful:", response.data);
        
        // Store the user ID in Redux
        if (response.data.userId) {
          dispatch(setUserId(response.data.userId));
        }
        
        // Store the token in localStorage if it exists in the response
        if (response.data.token) {
          localStorage.setItem('authToken', response.data.token);
        }
        
        setSubmitSuccess(true);
      } else {
        throw new Error(response.data.message || 'Failed to create profile');
      }
      
    } catch (error) {
      console.error("Profile creation failed:", error);
      if (axios.isAxiosError(error)) {
        setSubmitError(error.response?.data?.message || error.message);
      } else {
        setSubmitError((error as Error).message);
      }
    } finally {
      setIsSubmitting(false);
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
        <div className="grid ml-20 py-24 grid-cols-4 gap-5">
          {/* Left Section: Heading + Nav */}
          <div className="">
            <h1 className="text-5xl font-medium mb-6">
              Complete Your Profile
            </h1>

            <nav className="space-y-4">
              {tabs.map((tab) => (
                <Link
                  key={tab.id}
                  to={`#${tab.id}`}
                  className={cn(
                    "block py-2 text-lg",
                    currentTab === tab.id
                      ? "font-semibold text-xl"
                      : ""
                  )}
                >
                  {tab.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right Section: Form + Illustration */}
          <div className="relative col-span-2">
            <div className="bg-white/50 py-10 px-14 rounded-lg border backdrop-blur-md border-gray-200 shadow-sm relative z-10">
              {/* Render tab content */}
              {currentTab === "personal" && <PersonalInfoTab />}
              {currentTab === "skills" && <SkillsInterestsTab />}
              {currentTab === "avatar" && <SelectAvatarTab />}
              {currentTab === "photos" && <CoverProfilePhotosTab />}
              {currentTab === "communities" && <SelectCommunitiesTab />}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <button
                  onClick={handleBack}
                  className="flex items-center justify-center rounded-full w-10 h-10 border border-gray-300 text-gray-500 hover:bg-gray-50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                <button
                  onClick={handleNext}
                  disabled={isLastTab && isSubmitting}
                  className={`flex items-center justify-center space-x-1 rounded-full px-5 py-2 ${
                    isLastTab && isSubmitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gray-900 hover:bg-gray-800"
                  } text-white`}
                >
                  <span>{isLastTab ? (isSubmitting ? "Submitting..." : "Submit") : "Next"}</span>
                  {!isLastTab && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              </div>
              
              {/* Display submission status messages */}
              {isLastTab && (submitError || submitSuccess) && (
                <div className="mt-4 text-center">
                  {submitError && (
                    <div className="text-red-500">{submitError}</div>
                  )}
                  {submitSuccess && (
                    <div className="text-green-500">Profile created successfully!</div>
                  )}
                </div>
              )}
            </div>

            {/* 3D Illustration (Clipboard & Tick) */}
            {/* Position this absolutely so it appears to the right, like in your screenshot */}
            <div className="absolute top-5 -right-20 transform -translate-y-1/2 pointer-events-none hidden lg:block">
              <img
                src="/profile/clipboard.png"
                alt="Clipboard Check"
                className="w-36"
              />
            </div>

            <div className="absolute bottom-0 -right-20  pointer-events-none hidden lg:block">
              <img
                src="/profile/deco1.png"
                alt="decorative 1"
                className="w-36"
              />
            </div>

            <div className="absolute bottom-0 -left-16 pointer-events-none hidden lg:block">
              <img
                src="/profile/deco2.png"
                alt="decorative 2"
                className="w-36"
              />
            </div>

          </div>
          <div/>
        </div>

  );
};

export default SetupProfile;
