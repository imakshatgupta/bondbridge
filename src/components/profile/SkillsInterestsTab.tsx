import React, { useState } from 'react';

const SkillsInterestsTab: React.FC = () => {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    "Rock", "Indie Pop", "Fashion", "Motor Cycles"
  ]);

  const [skills, setSkills] = useState<string[]>([
    "NEWS", "Music", "Sports", "Racing cars", "Marketing",
    "Science", "Chess"
  ]);

  const addSkill = (skill: string) => {
    if (!selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill]);
      //remove from skills array
      setSkills(skills.filter(s => s !== skill));
    }
  };

  const removeSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skill));
    //add to skills array
    setSkills([...skills, skill]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {selectedSkills.map((selectedSkill) => (
          <button
            key={selectedSkill}
            className="bg-purple-500 text-white px-3 py-1 rounded-full flex items-center"
            onClick={() => removeSkill(selectedSkill)}
          >
            {selectedSkill} <span className="ml-2">✕</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {skills.map((skill) => (
          <button
            key={skill}
            className="border-2 border-gray-300 text-gray-700 px-3 py-1 rounded-full flex items-center"
            onClick={() => addSkill(skill)}
          >
            + {skill}
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center mt-4">
        <button className="text-blue-500">Explore More</button>
      </div>
    </div>
  );
};

export default SkillsInterestsTab; 