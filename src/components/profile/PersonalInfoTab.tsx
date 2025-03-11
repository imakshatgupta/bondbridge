import React, { useState } from "react";
import axios from "axios";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const PersonalInfoTab: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    dob: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post("https://your-api-endpoint.com/personal-info", formData);
      console.log("Response:", response.data);
      alert("Data submitted successfully!");
    } catch (error) {
      console.error("Error submitting data:", error);
      alert("Failed to submit data.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          type="text"
          id="name"
          value={formData.name}
          onChange={handleChange}
        />
      </div>
      
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          type="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
        />
      </div>
      
      <div>
        <Label htmlFor="dob">Date Of Birth</Label>
        <Input
          type="date"
          id="dob"
          value={formData.dob}
          onChange={handleChange}
        />
      </div>
      
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          type="password"
          id="password"
          value={formData.password}
          onChange={handleChange}
        />
      </div>

    </div>
  );
};

export default PersonalInfoTab;
