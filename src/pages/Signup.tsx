import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import OTPForm from "../components/auth/OTPForm";
import { Checkbox } from "@/components/ui/checkbox";
import axios from "axios";
import IntlTelInput from "react-intl-tel-input";
import "react-intl-tel-input/dist/main.css";
import { setUserId } from "@/store/createProfileSlice";
import { useAppDispatch } from "../store";
const Signup: React.FC = () => {
  const [showOTP, setShowOTP] = useState(false);
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("91"); // Default to India (+91)
  const [, setIsValidPhone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const phoneInputRef = useRef(null);
  const dispatch = useAppDispatch();

  interface CountryData {
    dialCode?: string;
    [key: string]: any; 
  }

  const handlePhoneChange = (
    isValid: boolean,
    value: string,
    selectedCountryData: CountryData,
  ) => {
    setIsValidPhone(isValid);
    if (selectedCountryData && selectedCountryData.dialCode) {
      setCountryCode(selectedCountryData.dialCode);
    }

    // Remove the country code from the phone number
    if (selectedCountryData && selectedCountryData.dialCode) {
      const dialCode = selectedCountryData.dialCode;
      let cleanNumber = value.replace(/\D/g, "");

      // If number starts with the dial code, remove it
      const dialCodeString = String(dialCode);
      if (cleanNumber.startsWith(dialCodeString)) {
        cleanNumber = cleanNumber.substring(dialCodeString.length);
      }

      setPhone(cleanNumber);
    } else {
      setPhone(value.replace(/\D/g, ""));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validCountryCode = "+" + countryCode;

    try {
      const response = await axios.post(
        `http://localhost:3000/api/send-otp`,
        {
          phoneNumber: phone,
          countryCode: validCountryCode,
        }
      );

      console.log("response ", response);
      if (response.request.status === 200) {
        setShowOTP(true);
      } else {
        setError(response.data.message || "Failed to send OTP");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.code === "ERR_NETWORK") {
        setError(
          "Unable to connect to server. Please check if the server is running."
        );
      } else if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.message || "Server error occurred");
      } else {
        setError("Failed to send OTP. Please try again.");
      }
      console.error("Error details:", error);
    }
  };

  const handleVerifyOTP = async (otp: string) => {
    setError(null);
    const validCountryCode = "+" + countryCode;
    console.log("phone ", phone);
    console.log("otp ", otp);
    console.log("countryCode ", validCountryCode);
    try {
      const response = await axios.post(
        "http://localhost:3000/api/verify-otp",
        { phoneNumber: phone, otp, countryCode: validCountryCode }, {
          headers: {
            "Content-Type": "application/json",
          }
        });
      console.log("response ", response);
      if (response.status === 200) {
        // Store token and user ID in localStorage
        localStorage.setItem('token', response.data.token);
        dispatch(setUserId(response.data.userDetails._id));

        navigate("/setup-profile");
      } else {
        setError(response.data.message || "Invalid OTP. Please try again.");
      }
    } catch (error: unknown) {
      setError("Network error. Please try again.");
      console.error("Error verifying OTP:", error);
    }
  };

  return (
    <>
      <style>{`
        /* Make phone input full width */
        .intl-tel-input {
          width: 100% !important;
          display: block !important;
        }
        .intl-tel-input .form-control {
          width: 100% !important;
        }
        
        /* Ensure dropdown works and flag is visible */
        .intl-tel-input .selected-flag {
          z-index: 10;
          padding: 0 6px 0 8px;
        }
        
        /* Make sure the dropdown appears above other elements */
        .intl-tel-input .country-list {
          z-index: 20;
        }
        
        /* Make dial code clickable */
        .intl-tel-input .selected-dial-code {
          cursor: pointer;
        }
        
        /* Ensure proper vertical alignment */
        .intl-tel-input .flag-container {
          height: 100%;
        }
        .intl-tel-input .selected-flag {
          height: 100%;
          display: flex;
          align-items: center;
        }
      `}</style>
      
      <AuthLayout
        title="Connecting Dreams, Fostering Growth"
        subtitle="Sign up for your Bond Bridge journey today!"
        image="/auth/signup.png"
        showOTP={showOTP}
        otpMessage="Welcome, We are glad to see you!"
      >
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {!showOTP ? (
          <form onSubmit={handleSubmit} className="space-y-4 w-full">
            <div className="w-full">
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                Phone
              </label>
              <div className="mt-1 w-full">
                <div className="w-full relative">
                  <IntlTelInput
                    ref={phoneInputRef}
                    containerClassName="intl-tel-input"
                    inputClassName="form-control w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    defaultCountry={"in"}
                    preferredCountries={["in"]}
                    onPhoneNumberChange={handlePhoneChange}
                    onPhoneNumberBlur={handlePhoneChange}
                    format={true}
                    formatOnInit={true}
                    autoPlaceholder={true}
                    nationalMode={false}
                    separateDialCode={true}
                    telInputProps={{
                      className: "w-full"
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="terms" required />
                <label htmlFor="terms" className="text-xs text-gray-700">
                  I agree to Bond's{" "}
                  <Link to="/terms" className="text-blue-500">
                    Terms of Conditions
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-blue-500">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="newsletter" />
                <label htmlFor="newsletter" className="text-xs text-gray-700">
                  I would like to receive updates about products, services, and
                  promotions
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign Up
            </button>
          </form>
        ) : (
          <>
            <OTPForm onVerify={handleVerifyOTP} />
            <button
              onClick={() => setShowOTP(false)}
              className="mt-4 text-blue-500 hover:underline"
            >
              Back
            </button>
          </>
        )}
      </AuthLayout>
    </>
  );
};

export default Signup;