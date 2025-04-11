import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface OTPFormProps {
  onVerify: (otp: string) => void;
  receivedOTP: string;
}

const OTPForm: React.FC<OTPFormProps> = ({ onVerify, receivedOTP }) => {
  const [otp, setOtp] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onVerify(otp);
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="otp" className="block text-sm font-medium text-foreground">OTP</label>
          <input
            type="text"
            id="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-muted-foreground rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <Button
          type="submit"
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
        >
          Verify
        </Button>
      </form>
      
      <div className="flex justify-center absolute left-0 right-0 text-center mt-4" style={{ top: "calc(100% + 20vh)" }}>
        <p className="text-foreground font-bold border-1 border-primary rounded-full text-xl w-fit p-2">
          {`OTP : ${receivedOTP}`}
        </p>
      </div>
    </div>
  );
};

export default OTPForm;
