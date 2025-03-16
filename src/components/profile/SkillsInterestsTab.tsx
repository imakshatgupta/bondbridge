import React from "react";
import { addSkill, removeSkill } from "../../store/createProfileSlice";
import { useAppDispatch, useAppSelector } from "../../store";
import { AVAILABLE_INTERESTS } from "@/lib/constants";

const SkillsInterestsTab: React.FC = () => {
  const dispatch = useAppDispatch();
  const { skillSelected } = useAppSelector(
    (state) => state.createProfile
  );

  const handleAddSkill = (skill: string) => {
    dispatch(addSkill(skill));
  };

  const handleRemoveSkill = (skill: string) => {
    dispatch(removeSkill(skill));
  };

  // Filter available interests to exclude already selected ones
  const availableInterests = AVAILABLE_INTERESTS.filter(
    (interest) => !skillSelected.includes(interest)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 overflow-y-auto max-h-[20vh]">
        {skillSelected.map((selectedSkill) => (
          <button
            key={selectedSkill}
            className="bg-primary text-primary-foreground px-3 py-1 rounded-full flex items-center"
            onClick={() => handleRemoveSkill(selectedSkill)}
          >
            {selectedSkill} <span className="ml-2 cursor-pointer">✕</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 overflow-y-auto h-[30vh]">
        {availableInterests.map((interest) => (
          <button
            key={interest}
            className="border-2 border-border text-foreground px-3 py-1 rounded-full flex items-center cursor-pointer hover:bg-secondary"
            onClick={() => handleAddSkill(interest)}
          >
            + {interest}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SkillsInterestsTab;