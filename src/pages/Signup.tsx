import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import OTPForm from "../components/auth/OTPForm";
import { Checkbox } from "@/components/ui/checkbox";
import IntlTelInput from "react-intl-tel-input";
import "react-intl-tel-input/dist/main.css";
import { sendOTP, verifyOTP } from "../apis/commonApiCalls/authenticationApi";
import { useApiCall } from "../apis/globalCatchError";
import { Toaster } from "@/components/ui/sonner";
import { VerifyOTPResponse } from "../apis/apiTypes/response";

const Signup: React.FC = () => {
  const [showOTP, setShowOTP] = useState(false);
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("1"); // Default to USA (+1)
  const [, setIsValidPhone] = useState(false);
  const navigate = useNavigate();
  const phoneInputRef = useRef(null);

  // Use our custom hooks for API calls
  const [executeSendOTP, isSendingOTP] = useApiCall(sendOTP);
  const [executeVerifyOTP, isVerifyingOTP] = useApiCall(verifyOTP);

  // Add effect to apply styles to the phone input after it's rendered
  useEffect(() => {
    const fixPhoneInputStyles = () => {
      const container = document.querySelector('.intl-tel-input');
      if (container) {
        // Make width consistent
        container.setAttribute('style', 'width: 100% !important; height: 40px !important;');
        
        // Fix flag container height
        const flagContainer = container.querySelector('.flag-container');
        if (flagContainer) {
          flagContainer.setAttribute('style', 'height: 100% !important;');
        }
        
        // Fix selected flag height
        const selectedFlag = container.querySelector('.selected-flag');
        if (selectedFlag) {
          selectedFlag.setAttribute('style', 'height: 100% !important; display: flex !important; align-items: center !important;');
        }
        
        // Fix input height
        const input = container.querySelector('input');
        if (input) {
          input.setAttribute('style', 'height: 40px !important;');
        }
      }
    };
    
    // Run initially and after a small delay to ensure component is rendered
    fixPhoneInputStyles();
    const timeoutId = setTimeout(fixPhoneInputStyles, 100);
    
    return () => clearTimeout(timeoutId);
  }, [showOTP]);

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
    
    const validCountryCode = "+" + countryCode;

    const result = await executeSendOTP({
      phoneNumber: phone,
      countryCode: validCountryCode,
    });

    if (result.success && result.data) {
      setShowOTP(true);
    }
  };

  const handleVerifyOTP = async (otp: string) => {
    const validCountryCode = "+" + countryCode;

    const result = await executeVerifyOTP({
      phoneNumber: phone,
      otp,
      countryCode: validCountryCode
    });
    
    if (result.success && result.data) {
      // Use the existing type instead of type assertion
      const data = result.data as VerifyOTPResponse;
      console.log(data);
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.userDetails._id);
      navigate("/setup-profile");
    }
  };

  return (
    <>
      <AuthLayout
        title="Connecting Dreams, Fostering Growth"
        subtitle="Sign up for your Bond Bridge journey today!"
        image="/auth/signup.png"
        showOTP={showOTP}
        otpMessage="Welcome, We are glad to see you!"
      >
        {!showOTP ? (
          <form onSubmit={handleSubmit} className="space-y-4 w-full">
            <div className="w-full">
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-foreground"
              >
                Phone
              </label>
              <div className="mt-1 relative" style={{ height: '40px' }}>
                <IntlTelInput
                  ref={phoneInputRef}
                  containerClassName="intl-tel-input"
                  inputClassName="form-control w-full h-10 px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  defaultCountry={"us"}
                  preferredCountries={["us"]}
                  onPhoneNumberChange={handlePhoneChange}
                  onPhoneNumberBlur={handlePhoneChange}
                  format={true}
                  formatOnInit={true}
                  autoPlaceholder={true}
                  nationalMode={false}
                  separateDialCode={true}
                  telInputProps={{
                    className: "w-full",
                    placeholder: "Enter phone number"
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="terms" required />
                <label htmlFor="terms" className="text-xs text-muted-foreground">
                  I agree to Bond's{" "}
                  <Link to="/terms" className="text-primary hover:underline">
                    Terms of Conditions
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="newsletter" />
                <label htmlFor="newsletter" className="text-xs text-muted-foreground">
                  I would like to receive updates about products, services, and
                  promotions
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              disabled={isSendingOTP}
            >
              {isSendingOTP ? "Sending OTP..." : "Sign Up"}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-sm text-muted-foreground">
                We've sent a verification code to your phone
              </p>
            </div>
            <OTPForm onVerify={handleVerifyOTP} />
            <button
              onClick={() => setShowOTP(false)}
              className="mt-4 text-primary hover:underline w-full text-center"
            >
              Back
            </button>
            {isVerifyingOTP && (
              <p className="text-center text-sm text-muted-foreground">Verifying...</p>
            )}
          </div>
        )}
      </AuthLayout>
      <Toaster />
    </>
  );
};

export default Signup;