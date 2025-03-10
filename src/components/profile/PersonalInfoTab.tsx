import React, { use,useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { 
  setName, 
  setEmail, 
  setDateOfBirth, 
  setPassword 
} from "../../features/createProfileSlice/createProfile";
import { RootState } from "../../app/store";

const PersonalInfoTab: React.FC = () => {
  const dispatch = useDispatch();
  const { name, email, dateOfBirth, password } = useSelector(
    (state: RootState) => state.createProfile
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    
    switch (id) {
      case "name":
        dispatch(setName(value));
        break;
      case "email":
        dispatch(setEmail(value));
        break;
      case "dob":
        dispatch(setDateOfBirth(value));
        break;
      case "password":
        dispatch(setPassword(value));
        break;
    }
  };

  const handleSubmit = async () => {
    try {
      const formData = {
        name, 
        email,
        dob: dateOfBirth,
        password
      };
      
      // console.log("Personal Info:", formData);

      const response = await axios.post("http://localhost:3000/api/edit-profile", formData);
      console.log("Response:", response.data);
      alert("Data submitted successfully!");
    } catch (error) {
      console.error("Error submitting data:", error);
      alert("Failed to submit data.");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <div>
        <label htmlFor="dob" className="block text-sm font-medium text-gray-700">Date Of Birth</label>
        <input
          type="date"
          id="dob"
          value={dateOfBirth}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <button
        onClick={handleSubmit}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Next
      </button>
    </div>
  );
};

export default PersonalInfoTab;
