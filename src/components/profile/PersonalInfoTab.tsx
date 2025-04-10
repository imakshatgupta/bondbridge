import React, { useState, useEffect } from "react";
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
import { Button } from "../ui/button";

interface PersonalInfoTabProps {
  onValidationChange?: (isValid: boolean) => void;
}

const PersonalInfoTab: React.FC<PersonalInfoTabProps> = ({ onValidationChange }) => {
  const dispatch = useDispatch();
  const { name, email, dateOfBirth, password } = useSelector(
    (state: RootState) => state.createProfile
  );
  const [showPassword, setShowPassword] = useState(false);

  // Validate all required fields
  useEffect(() => {
    const isNameValid = name.trim().length > 0;
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isDateOfBirthValid = dateOfBirth.trim().length > 0;
    const isPasswordValid = password.trim().length >= 6;
    
    const allValid = isNameValid && isEmailValid && isDateOfBirthValid && isPasswordValid;
    
    // Notify parent component of validation status
    if (onValidationChange) {
      onValidationChange(allValid);
    }
  }, [name, email, dateOfBirth, password, onValidationChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    
    switch (id) {
      case "name": {
        const capitalizedName = value.charAt(0).toUpperCase() + value.slice(1);
        dispatch(setName(capitalizedName));
        break;
      }
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

  const togglePasswordVisibility = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPassword(!showPassword);
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="name">
          Name<span className="text-destructive -ml-1">*</span>
        </Label>
        <Input
          type="text"
          id="name"
          value={name}
          onChange={handleChange}
        />
      </div>
      
      <div>
        <Label htmlFor="email">
          Email<span className="text-destructive -ml-1">*</span>
        </Label>
        <Input
          type="email"
          id="email"
          value={email}
          onChange={handleChange}
        />
      </div>
      
      <div>
        <Label htmlFor="dob">
          Date Of Birth<span className="text-destructive -ml-1">*</span>
        </Label>
        <Input
          type="date"
          id="dob"
          value={dateOfBirth}
          onChange={handleChange}
        />
      </div>
      
      <div>
        <Label htmlFor="password">
          Password<span className="text-destructive -ml-1">*</span>
        </Label>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            onChange={handleChange}
            className="pr-7"
          />
          <Button
            type="button"
            variant="ghost"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground cursor-pointer"
            onClick={togglePasswordVisibility}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoTab;
