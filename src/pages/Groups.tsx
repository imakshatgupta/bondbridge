import React from "react";
import { Link } from "react-router-dom";
import Grid, { GridContentPanel } from "@/components/grid";

const Groups: React.FC = () => {
  const groups = [
    { id: 1, name: "Design Enthusiasts", members: 128, image: "/groups/design.jpg" },
    { id: 2, name: "Tech Innovators", members: 256, image: "/groups/tech.jpg" },
    { id: 3, name: "Book Club", members: 64, image: "/groups/books.jpg" },
    { id: 4, name: "Fitness Community", members: 192, image: "/groups/fitness.jpg" },
  ];

  return (
    <Grid>
      <div className="col-span-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-medium">Groups</h1>
          <Link 
            to="/create-group" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create Group
          </Link>
        </div>

        <GridContentPanel>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <div key={group.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="h-40 bg-gray-200 overflow-hidden">
                  <img src={group.image} alt={group.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-medium mb-1">{group.name}</h3>
                  <p className="text-gray-600">{group.members} members</p>
                  <button className="mt-3 w-full py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                    View Group
                  </button>
                </div>
              </div>
            ))}
          </div>
        </GridContentPanel>
      </div>
    </Grid>
  );
};

export default Groups;
