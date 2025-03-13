import apiClient from '@/apis/apiClient';
import {
  SendOTPRequest,
  VerifyOTPRequest,
  LoginRequest,
  SetPasswordRequest,
} from '../apiTypes/request';
import {
  SendOTPResponse,
  VerifyOTPResponse,
  LoginResponse,
  SetPasswordResponse,
} from '../apiTypes/response';

// Function to send OTP for signup
export const sendOTP = async (phoneData: SendOTPRequest): Promise<SendOTPResponse> => {
  const { phoneNumber, countryCode } = phoneData;
  
  // Validate required fields
  if (!phoneNumber || !countryCode) {
    throw new Error('Phone number and country code are required');
  }
  
  const response = await apiClient.post<SendOTPResponse>(`/send-otp`, {
    phoneNumber,
    countryCode,
  });
  
  if (response.status === 200) {
    console.log(response.data);
    return response.data;
  } else {
    throw new Error(response.data.message || 'Failed to send OTP');
  }
};

// Function to verify OTP
export const verifyOTP = async (otpData: VerifyOTPRequest): Promise<VerifyOTPResponse> => {
  const { phoneNumber, countryCode, otp } = otpData;
  
  // Validate required fields
  if (!phoneNumber || !countryCode || !otp) {
    throw new Error('Phone number, country code, and OTP are required');
  }
  
  const response = await apiClient.post<VerifyOTPResponse>(`/verify-otp`, {
    phoneNumber,
    countryCode,
    otp
  });
  
  if (response.status === 200) {
    console.log(response.data);
    return response.data;
  } else {
    throw new Error(response.data.message || 'Failed to verify OTP');
  }
};

// Function to login with phone and password
export const loginUser = async (loginData: LoginRequest): Promise<LoginResponse> => {
  const { phoneNumber, countryCode, password } = loginData;
  
  // Validate required fields
  if (!phoneNumber || !countryCode || !password) {
    throw new Error('Phone number, country code, and password are required');
  }
  
  const response = await apiClient.post<LoginResponse>(`/login`, {
    phoneNumber,
    countryCode,
    password
  });
  
  if (response.status === 200) {
    console.log(response.data);
    return response.data;
  } else {
    throw new Error(response.data.message || 'Failed to login');
  }
};

// Function to set user password
export const setPassword = async (data: SetPasswordRequest): Promise<SetPasswordResponse> => {
  const { userId, password, token } = data;
  
  // Validate required fields
  if (!userId || !password || !token) {
    throw new Error('User ID, password, and token are required');
  }
  
  const response = await apiClient.put<SetPasswordResponse>(`/set-password`, {
    userId,
    password,
    token
  });
  
  if (response.status === 200) {
    console.log("Password set successfully:", response.data);
    return response.data;
  } else {
    throw new Error(response.data.message || 'Failed to set password');
  }
};

// commented out for now as we are not using password reset

// Function to request password reset
// export const requestPasswordReset = async (resetData: { phoneNumber: string; countryCode: string }) => {
//   const { phoneNumber, countryCode } = resetData;
  
//   // Validate required fields
//   if (!phoneNumber || !countryCode) {
//     throw new Error('Phone number and country code are required');
//   }
  
//   const response = await apiClient.post(`/request-password-reset`, {
//     phoneNumber,
//     countryCode
//   });
  
//   if (response.status === 200) {
//     return response.data;
//   } else {
//     throw new Error(response.data.message || 'Failed to request password reset');
//   }
// };

// commented out for now as we are not using password reset

// Function to reset password
// export const resetPassword = async (resetData: { phoneNumber: string; countryCode: string; otp: string; newPassword: string }) => {
//   const { phoneNumber, countryCode, otp, newPassword } = resetData;
  
//   // Validate required fields
//   if (!phoneNumber || !countryCode || !otp || !newPassword) {
//     throw new Error('All fields are required');
//   }
  
//   const response = await apiClient.post(`/reset-password`, {
//     phoneNumber,
//     countryCode,
//     otp,
//     newPassword
//   });
  
//   if (response.status === 200) {
//     return response.data;
//   } else {
//     throw new Error(response.data.message || 'Failed to reset password');
//   }
// };
