// src/components/AuthForm.tsx
import React from 'react';

interface AuthFormProps {
  isSignup?: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ isSignup, onSubmit }) => {
  return (
    <form onSubmit={onSubmit} className="flex flex-col">
      {isSignup && (
        <input type="text" placeholder="Phone" className="mb-4 p-2 border" required />
      )}
      <input type="email" placeholder="Email" className="mb-4 p-2 border" required />
      <input type="password" placeholder="Password" className="mb-4 p-2 border" required />
      <button type="submit" className="bg-blue-500 text-white p-2">
        {isSignup ? 'Sign Up' : 'Log In'}
      </button>
    </form>
  );
};

export default AuthForm;