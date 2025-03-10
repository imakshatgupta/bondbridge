import React, { useEffect } from 'react';
import axios from 'axios';
import {
  addSkill,
  removeSkill
} from '../../features/createProfileSlice/createProfile';
import { useAppDispatch, useAppSelector } from '../../app/store';

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

  const saveSkills = async () => {
    try {
      console.log("Saving skills:", skillSelected);
      const response = await axios.post("https://api.example.com/save-skills", {
        skills: skillSelected
      }, {
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      console.log("Skills saved successfully:", response.data);
    } catch (error) {
      console.error("Error saving skills:", error);
    }
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
            className="bg-purple-500 text-white px-3 py-1 rounded-full flex items-center"
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
            className="border-2 border-gray-300 text-gray-700 px-3 py-1 rounded-full flex items-center cursor-pointer hover:bg-gray-50"
            onClick={() => handleAddSkill(skill)}
          >
            + {skill}
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center mt-4">
        <button className="text-blue-500">Explore More</button>
        <button 
          className="bg-green-500 text-white px-4 py-2 rounded-md" 
          onClick={saveSkills}
        >
          Save Skills
        </button>
      </div>
    </div>
  );
};

export default SkillsInterestsTab;