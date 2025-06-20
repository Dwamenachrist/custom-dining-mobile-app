// Environment configuration
export const ENV = {

  PROD: 'https://custom-dining.onrender.com/api',
} as const;

// Current environment (change this based on your deployment)
const CURRENT_ENV: keyof typeof ENV = 'PROD';

// API configuration
export const API_CONFIG = {
  timeout: 30000,
  defaultHeaders: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
} as const;

// API endpoints - Updated to match actual backend
export const ENDPOINTS = {
  // Authentication - Updated paths
  signup: '/auth/register',
  login: '/auth/login',
  logout: '/auth/logout',
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/auth/reset-password',
  changePassword: '/auth/change-password',
  verifyEmail: '/auth/verify-email',
  resendVerification: '/auth/resend-verification',
  // sendOTPMobile: '/auth/send-otp-mobile', // Removed - not used
  // sendOTPEmail: '/auth/send-otp-email', // Removed - not used
  // verifyOTP: '/auth/verify-otp', // Removed - not used
  refreshToken: '/auth/refresh-token',
  
  // User
  profile: '/user/profile',
  updateProfile: '/user/profile',
  
  // App-specific endpoints (add as needed)
  restaurants: '/restaurants',
  meals: '/meals',
  orders: '/orders',
  reservations: '/reservations',
} as const;

// Get the appropriate API URL based on environment
export const getApiUrl = (): string => {
  return ENV[CURRENT_ENV];
};

export default API_CONFIG; 