import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import IntlTelInput from 'react-intl-tel-input';
import 'react-intl-tel-input/dist/main.css';
import { loginUser } from '../apis/commonApiCalls/authenticationApi';
import { useApiCall } from '../apis/globalCatchError';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { LoginResponse } from '../apis/apiTypes/response';

const Login: React.FC = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [countryCode, setCountryCode] = useState('+1'); // Default to India (+1)
    const [, setIsValidPhone] = useState(false);
    const [password, setPassword] = useState('');
    const phoneInputRef = useRef(null);
    const navigate = useNavigate();


    // Use our custom hook for API calls
    const [executeLogin, isLoggingIn] = useApiCall(loginUser);

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
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validCountryCode = "+" + countryCode;

        const result = await executeLogin({
            phoneNumber,
            countryCode: validCountryCode,
            password
        });

        console.log("result", result);

        if (result.success && result.data) {
            const data = result.data as LoginResponse;
            // commenting because link will change to /home so it will call the api automatically there
            // const userData = await fetchUserProfile(data.userDetails._id, data.userDetails._id);
            // if (userData.success) {
            //   dispatch(setCurrentUser(userData.data));
            // }
            
            if (data.userDetails.statusCode != 0) {
                navigate('/');
            }
        }
    };

    const handlePhoneChange = (isValid: boolean, value: string, selectedCountryData: { dialCode?: string }) => {
        setIsValidPhone(isValid);
        if (selectedCountryData && selectedCountryData.dialCode) {
            setCountryCode(selectedCountryData.dialCode);
        }

        // Remove the country code from the phone number
        if (selectedCountryData && selectedCountryData.dialCode) {
            const dialCode = String(selectedCountryData.dialCode);
            let cleanNumber = value.replace(/\D/g, '');

            // If number starts with the dial code, remove it
            if (cleanNumber.startsWith(dialCode)) {
                cleanNumber = cleanNumber.substring(dialCode.length);
            }

            setPhoneNumber(cleanNumber);
        } else {
            setPhoneNumber(value.replace(/\D/g, ''));
        }
    };

    return (
        <>
            <AuthLayout
                title="Empower your Journey, Welcome Back!"
                subtitle="Log in to unlock a world of endless possibilities"
                image="/auth/login.png"
                isLogin
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="phoneNumber" className="block text-sm font-medium text-foreground">Phone</Label>
                        <div className="mt-1 relative" style={{ height: '40px' }}>
                            <IntlTelInput
                                ref={phoneInputRef}
                                containerClassName="intl-tel-input"
                                inputClassName="form-control w-full h-10 px-3 py-2 border border-input rounded-md shadow-sm focus:outline-none focus:ring-ring focus:border-ring"
                                defaultCountry={'us'}
                                preferredCountries={['us']}
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
                    <div>
                        <Label htmlFor="password" className="block text-sm font-medium text-foreground">Password</Label>
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
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground"
                                style={{ top: '4px' }}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const passwordInput = document.getElementById('password') as HTMLInputElement;
                                    passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </Button>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Link to="/forgot-password" className="text-sm text-primary">Forgot Password?</Link>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoggingIn}
                    >
                        {isLoggingIn ? "Logging In..." : "Log In"}
                    </Button>
                </form>
            </AuthLayout>
        </>
    );
};

export default Login;