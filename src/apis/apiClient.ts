import axios from 'axios';
import { GET_AUTH_HEADERS } from '@/lib/constants';
import { store } from '@/store'; // Import your Redux store

// Create an Axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000, // Adjust timeout as needed
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Request interceptor to add auth headers automatically
apiClient.interceptors.request.use(
  (config) => {
    // Get userId from Redux store
    const userId = store.getState().createProfile.userId;
    const authHeaders = GET_AUTH_HEADERS(userId);
    
    // Apply all auth headers to the request
    config.headers = {
      ...config.headers,
      ...authHeaders
    };
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// For multipart form data requests
export const formDataApiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'multipart/form-data',
    'Accept': 'application/json',
  }
});

// Add the same interceptor to formDataApiClient
formDataApiClient.interceptors.request.use(
  (config) => {
    // Get userId from Redux store
    const userId = store.getState().createProfile.userId;
    const authHeaders = GET_AUTH_HEADERS(userId);
    
    config.headers = {
      ...config.headers,
      ...authHeaders
    };
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;