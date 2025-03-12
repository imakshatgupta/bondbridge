import axios from 'axios';
// Use import.meta.env for Vite or directly use the URL
const API_BASE_URL = 'http://localhost:3000/api';

// commented out for now as we are not using auth headers
// Helper function to get auth headers
// const getAuthHeaders = (userId?: string) => {
//   return {
//     'Content-Type': 'application/json',
//     'token': localStorage.getItem('token') || '',
//     'userId': userId || '',
//     'Authorization': `Bearer ${localStorage.getItem('token')}`
//   };
// };

// Function to send OTP for signup
export const sendOTP = async (phoneData: { phoneNumber: string; countryCode: string }) => {
  const { phoneNumber, countryCode } = phoneData;
  
  // Validate required fields
  if (!phoneNumber || !countryCode) {
    throw new Error('Phone number and country code are required');
  }
  
  const response = await axios.post(`${API_BASE_URL}/send-otp`, {
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
export const verifyOTP = async (otpData: { phoneNumber: string; countryCode: string; otp: string }) => {
  const { phoneNumber, countryCode, otp } = otpData;
  
  // Validate required fields
  if (!phoneNumber || !countryCode || !otp) {
    throw new Error('Phone number, country code, and OTP are required');
  }
  
  const response = await axios.post(`${API_BASE_URL}/verify-otp`, {
    phoneNumber,
    countryCode,
    otp
  }, {
    headers: {
      "Content-Type": "application/json",
    }
  });
  
  if (response.status === 200) {
    console.log(response.data);
    return response.data;
  } else {
    throw new Error(response.data.message || 'Failed to verify OTP');
  }
};

// Function to login with phone and password
export const loginUser = async (loginData: { phoneNumber: string; countryCode: string; password: string }) => {
  const { phoneNumber, countryCode, password } = loginData;
  
  // Validate required fields
  if (!phoneNumber || !countryCode || !password) {
    throw new Error('Phone number, country code, and password are required');
  }
  
  const response = await axios.post(`${API_BASE_URL}/login`, {
    phoneNumber,
    countryCode,
    password
  });
  
  if (response.status === 200) {
    return response.data;
  } else {
    throw new Error(response.data.message || 'Failed to login');
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
  
//   const response = await axios.post(`${API_BASE_URL}/request-password-reset`, {
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
  
//   const response = await axios.post(`${API_BASE_URL}/reset-password`, {
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