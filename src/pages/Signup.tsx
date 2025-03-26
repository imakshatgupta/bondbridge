import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import OTPForm from "../components/auth/OTPForm";
import { Checkbox } from "@/components/ui/checkbox";
import IntlTelInput from "react-intl-tel-input";
import "react-intl-tel-input/dist/main.css";
import { sendOTP, verifyOTP } from "../apis/commonApiCalls/authenticationApi";
import { useApiCall } from "../apis/globalCatchError";

// Custom styles for the phone input component that change with theme
const customPhoneInputStyles = `
  /* Theme Styles */
  .intl-tel-input .country-list {
    background-color: var(--background);
    color: var(--foreground);
    border-color: var(--border);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
  
  .intl-tel-input .country-list .country {
    color: var(--foreground);
  }
  
  .intl-tel-input .country-list .country.highlight {
    background-color: var(--muted);
  }
  
  .intl-tel-input .country-list .country .dial-code {
    color: var(--muted-foreground);
  }
  
  .intl-tel-input .selected-flag {
    background-color: transparent;
  }

  .intl-tel-input.allow-dropdown .flag-container:hover .selected-flag {
    background-color: var(--muted);
  }
  
  .intl-tel-input.allow-dropdown.separate-dial-code .selected-flag {
    background-color: var(--muted);
  }
  
  .intl-tel-input .selected-dial-code {
    color: var(--foreground);
    padding-left: 10px; /* Add padding between flag and country code */
  }
  
  .intl-tel-input input {
    background-color: var(--background);
    color: var(--foreground);
    border-color: var(--border);
  }
  
  .intl-tel-input input:focus {
    border-color: var(--ring);
    box-shadow: 0 0 0 2px var(--ring);
  }

  .intl-tel-input .country-list .divider {
    border-bottom-color: var(--border);
  }
  
  /* Fix spacing between flag and dial code */
  .intl-tel-input.separate-dial-code .selected-flag {
    padding-right: 6px !important;
  }
  
  .intl-tel-input.separate-dial-code .selected-dial-code {
    margin-left: 6px !important;
  }
`;

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
    // Apply custom theme styles
    const styleElement = document.createElement('style');
    styleElement.textContent = customPhoneInputStyles;
    document.head.appendChild(styleElement);

    const fixPhoneInputStyles = () => {
      const container = document.querySelector(".intl-tel-input");
      if (container) {
        // Make width consistent
        container.setAttribute(
          "style",
          "width: 100% !important; height: 40px !important;"
        );

        // Fix flag container height
        const flagContainer = container.querySelector(".flag-container");
        if (flagContainer) {
          flagContainer.setAttribute("style", "height: 100% !important;");
        }

        // Fix selected flag height
        const selectedFlag = container.querySelector(".selected-flag");
        if (selectedFlag) {
          selectedFlag.setAttribute(
            "style",
            "height: 100% !important; display: flex !important; align-items: center !important;"
          );
        }
        
        // Fix selected dial code (country code) spacing
        const selectedDialCode = container.querySelector(".selected-dial-code");
        if (selectedDialCode) {
          selectedDialCode.setAttribute("style", "margin-left: 6px !important; padding-left: 0 !important;");
        }

        // Fix input height
        const input = container.querySelector("input");
        if (input) {
          input.setAttribute("style", "height: 40px !important; background-color: var(--background) !important; color: var(--foreground) !important; border-color: var(--border) !important;");
          input.classList.add('border', 'border-input', 'rounded-md', 'shadow-sm', 'focus:outline-none', 'focus:ring-ring', 'focus:border-ring');
        }
      }
    };

    // Run initially and after a small delay to ensure component is rendered
    fixPhoneInputStyles();
    const timeoutId = setTimeout(fixPhoneInputStyles, 100);

    return () => {
      clearTimeout(timeoutId);
      document.head.removeChild(styleElement);
    };
  }, [showOTP]);

  interface CountryData {
    dialCode?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }

  const handlePhoneChange = (
    isValid: boolean,
    value: string,
    selectedCountryData: CountryData
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
      countryCode: validCountryCode,
    });

    if (result.success && result.data) {
      // commenting because link will change to /home so it will call the api automatically there
      // const userData = await fetchUserProfile(result.data?.userDetails._id, result.data?.userDetails._id);
      // if (userData.success) {
      //   dispatch(updateCurrentUser(userData.data));
      // }
      navigate("/setup-profile");
    }
  };

  return (
    <>
      <AuthLayout
        title="Connecting Dreams, Fostering Growth"
        subtitle="Sign up for your BondBridge journey today!"
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
              <div className="mt-1 relative" style={{ height: "40px" }}>
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
                    placeholder: "Enter phone number",
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="terms" required className="cursor-pointer"/>
                <label
                  htmlFor="terms"
                  className="text-xs text-muted-foreground"
                >
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
                <Checkbox id="newsletter" className="cursor-pointer"/>
                <label
                  htmlFor="newsletter"
                  className="text-xs text-muted-foreground"
                >
                  I would like to receive updates about products, services, and
                  promotions
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary cursor-pointer"
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
              <p className="text-center text-sm text-muted-foreground">
                Verifying...
              </p>
            )}
          </div>
        )}
      </AuthLayout>
    </>
  );
};

export default Signup;