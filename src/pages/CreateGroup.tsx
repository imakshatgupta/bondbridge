import React from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import GroupInfoTab from "@/components/groups/GroupInfoTab";
import SkillsInterestsTab from "@/components/groups/SkillsInterestsTab";
import SelectFriendsTab from "@/components/groups/SelectFriendsTab";
import Grid, { GridContentPanel } from "@/components/grid";

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
    <Grid>
      {/* Left Section: Heading + Nav */}
      <div className="">
        <h1 className="text-5xl font-medium mb-6">
          Create Group
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
        <GridContentPanel>
          {/* Render tab content */}
          {currentTab === "info" && <GroupInfoTab />}
          {currentTab === "skills" && <SkillsInterestsTab />}
          {currentTab === "friends" && <SelectFriendsTab />}

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
              className="flex items-center justify-center space-x-1 rounded-full px-5 py-2 bg-gray-900 text-white hover:bg-gray-800"
            >
              <span>Next</span>
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
            </button>
          </div>
        </GridContentPanel>

        {/* Clipboard illustration */}
        <div className="absolute top-5 -right-20 transform -translate-y-1/2 pointer-events-none hidden lg:block">
          <img
            src="/groups/clipboard.png"
            alt="Clipboard Check"
            className="w-36"
          />
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 -right-20 pointer-events-none hidden lg:block">
          <img
            src="/groups/deco1.png"
            alt="decorative 1"
            className="w-36"
          />
        </div>

        <div className="absolute bottom-0 -left-16 pointer-events-none hidden lg:block">
          <img
            src="/groups/deco2.png"
            alt="decorative 2"
            className="w-36"
          />
        </div>
      </div>
      <div />
    </Grid>
  );
};

export default CreateGroup; 