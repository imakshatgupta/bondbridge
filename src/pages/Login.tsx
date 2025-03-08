// src/pages/Login.tsx
import React, { useState } from 'react';
import AuthLayout from '../components/auth/AuthLayout';
import OTPForm from '../components/auth/OTPForm';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Login: React.FC = () => {
    const [showOTP, setShowOTP] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Show OTP screen after form submission
        setShowOTP(true);
    };

    const handleVerifyOTP = (otp: string) => {
        // Handle OTP verification logic
        console.log('Verifying OTP:', otp);
        // Redirect to dashboard or home page after successful verification
    };

    const handleBack = () => {
        setShowOTP(false);
    };

    return (
        <AuthLayout
            title="Empower your Journey, Welcome Back!"
            subtitle="Log in to unlock a world of endless possibilities"
            image="/auth/login.png"
            isLogin
            showOTP={showOTP}
            otpMessage="Welcome back, I'm so happy to see you again!"
        >
            {!showOTP ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            id="email"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>

                        <div className="relative">
                            <input
                                type="password"
                                id="password"
                                className="mt-1 block w-full pr-7 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                            <Button
                                variant={"ghost"}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
                                style={{ top: '4px' }}
                                onClick={() => {
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
            ) : (
                <>
                    <OTPForm onVerify={handleVerifyOTP} />
                    <button
                        onClick={handleBack}
                        className="mt-4 text-blue-500 hover:underline"
                    >
                        Back
                    </button>
                </>
            )}
        </AuthLayout>
    );
};

export default Login;