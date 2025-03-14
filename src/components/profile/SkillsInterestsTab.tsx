import React from "react";
import { addSkill, removeSkill } from "../../store/createProfileSlice";
import { useAppDispatch, useAppSelector } from "../../store";

const SkillsInterestsTab: React.FC = () => {
  const dispatch = useAppDispatch();
  const { skillSelected, skillsAvailable } = useAppSelector(
    (state) => state.createProfile
  );

  const handleAddSkill = (skill: string) => {
    dispatch(addSkill(skill));
  };

  const handleRemoveSkill = (skill: string) => {
    dispatch(removeSkill(skill));
  };

  // useEffect(() => {
  //   console.log("Selected Skills:", skillSelected);
  // }, [skillSelected]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
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

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {skillsAvailable.map((skill) => (
          <button
            key={skill}
            className="border-2 border-border text-foreground px-3 py-1 rounded-full flex items-center cursor-pointer hover:bg-secondary"
            onClick={() => handleAddSkill(skill)}
          >
            + {skill}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SkillsInterestsTab;