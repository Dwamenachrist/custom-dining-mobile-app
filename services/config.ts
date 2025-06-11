// Environment configuration
export const ENV = {
  DEV: 'http://localhost:3006/api',  // Updated to match actual backend
  STAGING: 'https://api-staging.example.com/api', 
  PROD: 'https://api.example.com/api',
} as const;

// Current environment (change this based on your deployment)
const CURRENT_ENV: keyof typeof ENV = 'DEV';

// API configuration
export const API_CONFIG = {
  timeout: 10000, // 10 seconds
  defaultHeaders: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
} as const;

// API endpoints - Updated to match actual backend
export const ENDPOINTS = {
  // Authentication - Updated paths
  signup: '/auth/register',              // Changed from /auth/signup
  login: '/auth/login',
  logout: '/auth/logout',
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/auth/reset-password',
  sendOTPMobile: '/auth/send-otp-mobile',
  sendOTPEmail: '/auth/send-otp-email',
  verifyOTP: '/auth/verify-otp',
  refreshToken: '/auth/refresh-token',
  verifyEmail: '/auth/verify-email',
  
  // User
  profile: '/users/profile',
  updateProfile: '/users/profile',
  changePassword: '/users/change-password',
  
  // App-specific endpoints (add as needed)
  restaurants: '/restaurants',
  menu: '/menu',
  orders: '/orders',
  reservations: '/reservations',
} as const;

// Get the appropriate API URL based on environment
export const getApiUrl = (): string => {
  return ENV[CURRENT_ENV];
};

export default API_CONFIG; 