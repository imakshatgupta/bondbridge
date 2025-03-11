import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import OTPForm from '../components/auth/OTPForm';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const Signup: React.FC = () => {
  const [showOTP, setShowOTP] = useState(false);
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // const response = await fetch('/api/send-otp', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ phone }),
      // });

      const response = {
        ok: true,
        json: async () => ({})
      } 

      const data = await response.json();

      if (response.ok) {
        setShowOTP(true);
      } else {
        setError(data.message || 'Failed to send OTP. Try again.');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error sending OTP:', error);
    }
  };

  const handleVerifyOTP = async (otp: string) => {
    setError(null);

    try {
      // const response = await fetch('/api/verify-otp', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ phone, otp }),
      // });

      const response = {
        ok: true,
        json: async () => ({})
      }

      const data = await response.json();

      if (response.ok) {
        // await registerUser();
        alert('OTP verified successfully');
      } else {
        setError(data.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error verifying OTP:', error);
    }
  };

  const registerUser = async () => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/dashboard');
      } else {
        setError(data.message || 'Registration failed. Try again.');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error registering user:', error);
    }
  };

  return (
    <AuthLayout 
      title="Connecting Dreams, Fostering Growth" 
      subtitle="Sign up for your Bond Bridge journey today!"
      image="/auth/signup.png"
      showOTP={showOTP}
      otpMessage="Welcome, We are glad to see you!"
    >
      {error && <p className="text-destructive text-sm">{error}</p>}

      {!showOTP ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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
                variant="ghost"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground"
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
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" required />
              <label htmlFor="terms" className="text-xs text-muted-foreground">
                I agree to Bond's <Link to="/terms" className="text-primary hover:underline">Terms of Conditions</Link> and <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="newsletter" />
              <label htmlFor="newsletter" className="text-xs text-muted-foreground">
                I would like to receive updates about products, services, and promotions
              </label>
            </div>
          </div>
          
          <Button type="submit" className="w-full">
            Sign Up
          </Button>
        </form>
      ) : (
        <>
          <OTPForm onVerify={handleVerifyOTP} />
          <Button
            variant="link"
            onClick={() => setShowOTP(false)}
            className="mt-4"
          >
            Back
          </Button>
        </>
      )}

      <p className="text-sm text-muted-foreground text-center mt-4">
        Already have an account? <Link to="/login" className="text-primary">Log in</Link>
      </p>
    </AuthLayout>
  );
};

export default Signup;