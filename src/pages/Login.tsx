import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import OTPForm from '../components/auth/OTPForm';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import IntlTelInput from 'react-intl-tel-input';
import 'react-intl-tel-input/dist/main.css';
import { log } from 'console';

const Login: React.FC = () => {
    const [showOTP, setShowOTP] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [countryCode, setCountryCode] = useState('91'); // Default to India (+91)
    const [isValidPhone, setIsValidPhone] = useState(false);
    const [password, setPassword] = useState('');
    const [otpMessage, setOtpMessage] = useState('');
    const phoneInputRef = useRef(null);
    const navigate = useNavigate();



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // if (!isValidPhone) {
        //     alert('Please enter a valid phone number');
        //     return;
        // }

        let validCountryCode = "+" + countryCode;

        try {
            console.log("phone no ", phoneNumber);
            console.log("countryCode ", validCountryCode);
            console.log("password ", password);

            const { data } = await axios.post('http://localhost:3000/api/login', {
                phoneNumber,
                countryCode: validCountryCode,
                password
            });
            // console.log("data ", data);
            if (data.userDetails.statusCode == 1) {
                navigate('/');
            }
            else {
                console.error("cannot find user");
            }
        } catch (error: any) {
            alert(error.response?.data?.message || 'Invalid credentials');
        }
    };

    const handlePhoneChange = (isValid, value, selectedCountryData, fullNumber, extension) => {
        setIsValidPhone(isValid);
        if (selectedCountryData && selectedCountryData.dialCode) {
            setCountryCode(selectedCountryData.dialCode);
        }

        // Remove the country code from the phone number
        if (selectedCountryData && selectedCountryData.dialCode) {
            const dialCode = selectedCountryData.dialCode;
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
        <AuthLayout
            title="Empower your Journey, Welcome Back!"
            subtitle="Log in to unlock a world of endless possibilities"
            image="/auth/login.png"
            isLogin
        >

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone</label>
                    <div className="mt-1">
                        <IntlTelInput
                            ref={phoneInputRef}
                            containerClassName="intl-tel-input"
                            inputClassName="form-control w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            defaultCountry={'in'}
                            preferredCountries={['in']}
                            onPhoneNumberChange={handlePhoneChange}
                            onPhoneNumberBlur={handlePhoneChange}
                            format={true}
                            formatOnInit={true}
                            autoPlaceholder={true}
                            nationalMode={false}
                            separateDialCode={true}
                            required
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                    <div className="relative">
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full pr-7 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                        <Button
                            type="button"
                            variant={"ghost"}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
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
                    <Link to="/forgot-password" className="text-sm text-blue-500">Forgot Password?</Link>
                </div>

                <button
                    type="submit"
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Log In
                </button>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">or</span>
                    </div>
                </div>
            </form>
        </AuthLayout>
    );
};

export default Login;