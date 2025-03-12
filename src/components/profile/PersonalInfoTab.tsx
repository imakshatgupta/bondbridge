import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  setName, 
  setEmail, 
  setDateOfBirth,
  setPassword 
} from "../../store/createProfileSlice";
import { RootState } from "../../store";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

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
    <div className="space-y-6">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          type="text"
          id="name"
          value={name}
          onChange={handleChange}
        />
      </div>
      
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          type="email"
          id="email"
          value={email}
          onChange={handleChange}
        />
      </div>
      
      <div>
        <Label htmlFor="dob">Date Of Birth</Label>
        <Input
          type="date"
          id="dob"
          value={dateOfBirth}
          onChange={handleChange}
        />
      </div>
      
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          type="password"
          id="password"
          value={password}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

export default PersonalInfoTab;
