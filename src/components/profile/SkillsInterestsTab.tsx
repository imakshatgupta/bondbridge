import React, { useRef, useEffect, useState } from "react";
import { addSkill, removeSkill } from "../../store/createProfileSlice";
import { useAppDispatch, useAppSelector } from "../../store";
import { AVAILABLE_INTERESTS } from "@/lib/constants";

// Interest item component for available interests
const AvailableInterestItem = ({ interest, onAdd }: { interest: string; onAdd: (interest: string) => void }) => {
  const textRef = useRef<HTMLSpanElement>(null);
  const [title, setTitle] = useState<string | undefined>(undefined);
  
  useEffect(() => {
    if (textRef.current && textRef.current.scrollWidth > textRef.current.clientWidth) {
      setTitle(interest);
    }
  }, [interest]);
  
  return (
    <button
      className="border-2 border-border text-foreground px-3 py-1 rounded-full flex items-center cursor-pointer hover:bg-secondary"
      onClick={() => onAdd(interest)}
      title={title}
    >
      <span className="flex-shrink-0">+</span>
      <span ref={textRef} className="truncate ml-1 max-w-[150px]">{interest}</span>
    </button>
  );
};

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
          <AvailableInterestItem 
            key={interest} 
            interest={interest} 
            onAdd={handleAddSkill} 
          />
        ))}
      </div>
    </div>
  );
};

export default SkillsInterestsTab;