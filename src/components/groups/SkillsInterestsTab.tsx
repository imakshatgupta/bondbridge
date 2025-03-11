import React from "react";

const SkillsInterestsTab: React.FC = () => {
  const categories = [
    {
      name: "Professional",
      skills: ["Marketing", "Design", "Engineering", "Finance", "Sales", "HR", "Operations"]
    },
    {
      name: "Creative",
      skills: ["Photography", "Writing", "Music", "Art", "Dance", "Film", "Theater"]
    },
    {
      name: "Lifestyle",
      skills: ["Fitness", "Cooking", "Travel", "Fashion", "Gaming", "Reading", "Meditation"]
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-medium mb-4">Select Group Skills & Interests</h2>
      <p className="text-gray-600 mb-6">
        Choose skills and interests relevant to your group. This helps members find your group.
      </p>

      {categories.map((category) => (
        <div key={category.name} className="mb-6">
          <h3 className="text-lg font-medium mb-3">{category.name}</h3>
          <div className="flex flex-wrap gap-2">
            {category.skills.map((skill) => (
              <button
                key={skill}
                className="px-4 py-2 rounded-full border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkillsInterestsTab; 