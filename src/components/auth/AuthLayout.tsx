import React from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  image: string;
  isLogin?: boolean;
  showOTP?: boolean;
  otpMessage?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  title, 
  subtitle, 
  image,
  isLogin = false,
  showOTP = false,
  otpMessage = "Welcome, We are glad to see you!"
}) => {
  return (
    <div className="md:px-40">
      <div className="mx-auto grid grid-cols-1 md:grid-cols-2">
        <div className="flex flex-col p-8">
          
          {!showOTP && (
            <>
              <div className="flex space-x-6 mb-8 text-3xl font-bold">
                <Link 
                  to="/signup" 
                  className={`${!isLogin ? 'text-foreground uppercase' : 'text-muted-foreground'}`}
                >
                  SIGN UP
                </Link>
                <Link 
                  to="/login" 
                  className={`${isLogin ? 'text-foreground uppercase' : 'text-muted-foreground'}`}
                >
                  LOG IN
                </Link>
              </div>
              
              {isLogin && (
                <p className="text-sm text-muted-foreground mb-4">Welcome back, I'm so happy to see you again!</p>
              )}
              
              {!isLogin && (
                <p className="text-sm text-muted-foreground mb-4">Welcome, we are glad to see you!</p>
              )}
            </>
          )}
          
          {showOTP && (
            <div className="mb-4">
              <h2 className="text-xl font-bold mb-1">Enter OTP</h2>
              <p className="text-sm text-muted-foreground">{otpMessage}</p>
            </div>
          )}
          
          {children}
          

          
          {/* {!isLogin && (
            <div className="mt-4 text-xs text-gray-500">
              <p>By signing up, you are creating a <strong>BOND</strong> account,</p>
              <p>and you agree to Bond's <Link to="/terms" className="text-blue-500">Terms of Conditions</Link> and <Link to="/privacy" className="text-blue-500">Privacy Policy</Link>.</p>
              <p className="mt-2">Already have an account? <Link to="/login" className="text-blue-500">Login</Link></p>
            </div>
          )} */}
        </div>
        
        <div className="hidden md:flex flex-col justify-between p-8 pb-0 h-[calc(100vh-64px)]">

            <h1 className="text-5xl 2xl:text-6xl font-semibold mb-2 ">{title}</h1>
            <p className="text-muted-foreground text-xl 2xl:text-2xl mb-8">{subtitle}</p>
            <img src={image} alt="Illustration" className="-mt-20 mx-auto aspect-auto" />
       
        </div>
      </div>
    </div>
  );
};

export default AuthLayout; 