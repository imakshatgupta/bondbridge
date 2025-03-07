// src/components/AuthPage.tsx
import React from 'react';
import AuthForm from './AuthForm';
import AuthHeader from './AuthHeader';

interface AuthPageProps {
  isSignup?: boolean;
  title: string;
  subtitle: string;
}

const AuthPage: React.FC<AuthPageProps> = ({ isSignup, title, subtitle }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <AuthHeader title={title} subtitle={subtitle} />
      <AuthForm isSignup={isSignup} onSubmit={handleSubmit} />
    </div>
  );
};

export default AuthPage;