import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import IntlTelInput from "react-intl-tel-input";
import "react-intl-tel-input/dist/main.css";
import { loginUser } from "../apis/commonApiCalls/authenticationApi";
import { useApiCall } from "../apis/globalCatchError";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LoginResponse } from "../apis/apiTypes/response";
import { useDispatch } from "react-redux";
import { updateCurrentUser } from "../store/currentUserSlice";

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

const Login: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+1"); // Default to India (+1)
  const [, setIsValidPhone] = useState(false);
  const [password, setPassword] = useState("");
  const phoneInputRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Use our custom hook for API calls
  const [executeLogin, isLoggingIn] = useApiCall(loginUser);

  // Add effect to apply styles to the phone input after it's rendered
  useEffect(() => {
    // Apply custom theme styles
    const styleElement = document.createElement("style");
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
          selectedDialCode.setAttribute(
            "style",
            "margin-left: 6px !important; padding-left: 0 !important;"
          );
        }

        // Fix input height
        const input = container.querySelector("input");
        if (input) {
          input.setAttribute(
            "style",
            "height: 40px !important; background-color: var(--background) !important; color: var(--foreground) !important; border-color: var(--border) !important;"
          );
          input.classList.add(
            "border",
            "border-input",
            "rounded-md",
            "shadow-sm",
            "focus:outline-none",
            "focus:ring-ring",
            "focus:border-ring"
          );
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
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validCountryCode = "+" + countryCode;

    const result = await executeLogin({
      phoneNumber,
      countryCode: validCountryCode,
      password,
    });

    console.log("result", result);

    const data = result.data as LoginResponse;

    // Store the same data in Redux
    dispatch(
      updateCurrentUser({
        userId: data.userDetails._id,
        token: data.token,
        username: data.userDetails.name || "",
        email: data.userDetails.email || "",
        avatar: data.userDetails.avatar || data.userDetails.profilePic || "",
      })
    );

    if (data.userDetails.statusCode != 0) {
      navigate("/");
    }
  };

  const handlePhoneChange = (
    isValid: boolean,
    value: string,
    selectedCountryData: { dialCode?: string }
  ) => {
    setIsValidPhone(isValid);
    if (selectedCountryData && selectedCountryData.dialCode) {
      setCountryCode(selectedCountryData.dialCode);
    }

    // Remove the country code from the phone number
    if (selectedCountryData && selectedCountryData.dialCode) {
      const dialCode = String(selectedCountryData.dialCode);
      let cleanNumber = value.replace(/\D/g, "");

      // If number starts with the dial code, remove it
      if (cleanNumber.startsWith(dialCode)) {
        cleanNumber = cleanNumber.substring(dialCode.length);
      }

      setPhoneNumber(cleanNumber);
    } else {
      setPhoneNumber(value.replace(/\D/g, ""));
    }
  };

  return (
    <>
      <AuthLayout
        title="Empower Your Journey, Welcome Back!"
        subtitle="Log in to unlock a world of endless possibilities"
        image="/auth/login.png"
        isLogin
      >
        <form onSubmit={handleSubmit} className="space-y-4 flex flex-col items-center">
          <div className="flex flex-col justify-start w-full">
            <Label
              htmlFor="phoneNumber"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Phone
            </Label>
            <div className="relative">
              <IntlTelInput
                ref={phoneInputRef}
                containerClassName="intl-tel-input"
                inputClassName="form-control w-full h-10 px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring"
                defaultCountry={"us"}
                preferredCountries={["us"]}
                onPhoneNumberChange={handlePhoneChange}
                onPhoneNumberBlur={handlePhoneChange}
                format={true}
                formatOnInit={true}
                autoPlaceholder={true}
                nationalMode={false}
                separateDialCode={true}
              />
            </div>
          </div>
          <div className="flex flex-col justify-start w-full">
            <Label
              htmlFor="password"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Password
            </Label>
            <div className="relative">
              <Input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full h-10 pr-7 px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring"
                required
              />
              <Button
                type="button"
                variant={"ghost"}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground cursor-pointer"
                style={{ top: "4px" }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const passwordInput = document.getElementById(
                    "password"
                  ) as HTMLInputElement;
                  passwordInput.type =
                    passwordInput.type === "password" ? "text" : "password";
                }}
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
          <div className="flex justify-end w-full">
            <Link
              to="/forgot-password"
              className="text-sm text-foreground hover:text-muted-foreground"
            >
              Forgot Password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full cursor-pointer"
            disabled={isLoggingIn}
          >
            {isLoggingIn ? "Logging In..." : "Log In"}
          </Button>
          <div className="flex justify-center absolute bottom-8 pt-4">
            {/* <p className="text-md text-center text-muted-foreground">Get the app:</p> */}
            <div className="flex justify-center gap-4">
              <Link to="#" className="h-44">
                <img
                  src="/assets/stores/appstore.svg"
                  alt="Download on App Store"
                  className="h-full"
                />
              </Link>
              <Link to="#" className="h-44">
                <img
                  src="/assets/stores/googleplay.svg"
                  alt="Get it on Google Play"
                  className="h-full"
                />
              </Link>
            </div>
          </div>
        </form>
      </AuthLayout>
    </>
  );
};

export default Login;
