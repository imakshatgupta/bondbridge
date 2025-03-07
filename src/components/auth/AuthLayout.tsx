import React from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  image: string;
  isLogin?: boolean;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  title, 
  subtitle, 
  image,
  isLogin = false 
}) => {
  return (
    <div className=" md:px-40">
      <div className="mx-auto grid grid-cols-1 md:grid-cols-2">
        <div className="flex flex-col p-8">

          
          <div className="flex space-x-6 mb-8 text-3xl font-bold">
            <Link 
              to="/signup" 
              className={` ${!isLogin ? 'text-black uppercase' : 'text-gray-400'}`}
            >
              SIGN UP
            </Link>
            <Link 
              to="/login" 
              className={` ${isLogin ? 'text-black uppercase' : 'text-gray-400'}`}
            >
              LOG IN
            </Link>
          </div>
          
          {isLogin && (
            <p className="text-sm text-gray-500 mb-4">Welcome back, I'm so happy to see you again!</p>
          )}
          
          {!isLogin && (
            <p className="text-sm text-gray-500 mb-4">Welcome, we are glad to see you!</p>
          )}
          
          {children}
          
          {isLogin && (
            <div className="mt-4 text-center text-xs text-gray-500">
              Not a member of "Bond Community"? <Link to="/signup" className="text-blue-500">Sign up</Link>
            </div>
          )}
          
          {/* {!isLogin && (
            <div className="mt-4 text-xs text-gray-500">
              <p>By signing up, you are creating a <strong>BOND</strong> account,</p>
              <p>and you agree to Bond's <Link to="/terms" className="text-blue-500">Terms of Conditions</Link> and <Link to="/privacy" className="text-blue-500">Privacy Policy</Link>.</p>
              <p className="mt-2">Already have an account? <Link to="/login" className="text-blue-500">Login</Link></p>
            </div>
          )} */}
        </div>
        
        <div className="hidden md:flex flex-col justify-center items-center p-8 pb-0">
          <div className="">
            <h1 className="text-6xl font-semibold mb-2 ">{title}</h1>
            <p className="text-gray-600 text-2xl mb-8">{subtitle}</p>
            <img src={image} alt="Illustration" className="-mt-20 mx-auto aspect-auto" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout; 