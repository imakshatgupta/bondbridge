// src/pages/Signup.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

const Signup: React.FC = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle signup logic
  };

  return (
    <AuthLayout 
      title="Connecting Dreams, Fostering Growth" 
      subtitle="Sign up for your Bond Bridge journey today!"
      image="/auth/signup.png"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
          <input
            type="tel"
            id="phone"
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
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="terms" />
            <label htmlFor="terms" className="text-xs text-gray-700">
              I agree to Bond's <Link to="/terms" className="text-blue-500">Terms of Conditions</Link> and <Link to="/privacy" className="text-blue-500">Privacy Policy</Link>
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox id="newsletter" />
            <label htmlFor="newsletter" className="text-xs text-gray-700">
              I would like to receive updates about products, services, and promotions
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
    </AuthLayout>
  );
};

export default Signup;