import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import OTPForm from '../components/auth/OTPForm';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const Login: React.FC = () => {
    const [showOTP, setShowOTP] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otpMessage, setOtpMessage] = useState('');
    const navigate = useNavigate();

    

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Send OTP after successful email/password verification
                const otpResponse = await fetch('/api/auth/send-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email }),
                });

                if (otpResponse.ok) {
                    setShowOTP(true);
                    setOtpMessage('OTP sent successfully. Please enter the OTP to continue.');
                } else {
                    throw new Error('Failed to send OTP');
                }
            } else {
                throw new Error(data.message || 'Invalid credentials');
            }
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleVerifyOTP = async (otp: string) => {
        try {
            const response = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
            });

            const data = await response.json();

            if (response.ok) {
                navigate('/home'); // Redirect to home page after OTP verification
            } else {
                throw new Error(data.message || 'Invalid OTP');
            }
        } catch (error: any) {
            alert(error.message);
        }
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
            otpMessage={otpMessage}
        >
            {!showOTP ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <Button
                                variant={"ghost"}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground"
                                style={{ top: '0px' }}
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
                        <Link to="/forgot-password" className="text-sm text-primary">Forgot Password?</Link>
                    </div>

                    <Button
                        type="submit"
                        className="w-full "
                    >
                        Log In
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-background text-muted-foreground">or</span>
                        </div>
                    </div>
                </form>
            ) : (
                <>
                    <OTPForm onVerify={handleVerifyOTP} />
                    <Button
                        onClick={handleBack}
                        className="mt-4 text-primary hover:underline"
                    >
                        Back
                    </Button>
                </>
            )}
        </AuthLayout>
    );
};

export default Login;