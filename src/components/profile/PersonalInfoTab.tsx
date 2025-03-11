import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  setName, 
  setEmail, 
  setDateOfBirth,
  setPassword 
} from "../../store/createProfileSlice";
import { RootState } from "../../store";

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
    </div>
  );
};

export default PersonalInfoTab;
