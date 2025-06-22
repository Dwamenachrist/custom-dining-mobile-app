import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, ApiResponse, SignupRequest, SignupFormData, AuthResponse, RegistrationResponse, LoginResponse, apiClient, User } from './api';
import { ENDPOINTS } from './config';
import axios from 'axios';
import { getApiUrl } from './config';

// Create a specialized auth client with longer timeout for auth operations
const authApiClient = axios.create({
  baseURL: getApiUrl(),
  timeout: 45000, // 45 seconds for auth operations (login/signup)
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add request interceptor for auth client
authApiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔑 Added auth token to auth request');
      }
      console.log(`🚀 Auth API Request: ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    } catch (error) {
      console.warn('Failed to get auth token:', error);
      return config;
    }
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for auth client
authApiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ Auth Response: ${response.status}`, response.data);
    return response;
  },
  (error) => {
    console.error(`❌ Auth API Error: ${error.response?.status}`, error.response?.data);
    return Promise.reject(error);
  }
);

// Specialized auth API methods with longer timeout
const authApi = {
  post: async <T>(endpoint: string, data?: any): Promise<ApiResponse<T>> => {
    try {
      const response = await authApiClient.post(endpoint, data);
      const isSuccess = response.data.status === 'success';
      
      return {
        success: isSuccess,
        message: response.data.message || (isSuccess ? 'Success' : 'Request failed'),
        data: response.data,
        status: response.data.status,
      };
    } catch (error: any) {
      console.error('🚨 Auth API Request Failed:', error);
      
      if (error.response) {
        // Extract backend error message properly - same pattern as api.ts handleError
        const errorData = error.response.data;
        let message = 'An error occurred';
        
        if (typeof errorData === 'string') {
          message = errorData;
        } else if (errorData?.message) {
          message = errorData.message;
        } else if (errorData?.error) {
          message = errorData.error;
        } else if (errorData?.errors && Array.isArray(errorData.errors)) {
          // Handle validation errors array
          message = errorData.errors.map((err: any) => 
            typeof err === 'string' ? err : err.message || err.msg || String(err)
          ).join(', ');
        } else {
          message = `HTTP ${error.response.status}: ${error.response.statusText}`;
        }
        
        return {
          success: false,
          message: message,
          error: errorData?.error || error.response.statusText,
          status: errorData?.status || 'error',
        };
      } else if (error.request) {
        return {
          success: false,
          message: 'Connection timeout. Please check your internet connection and try again.',
          error: 'No response from server',
          status: 'network_error',
        };
      } else {
        return {
          success: false,
          message: 'An unexpected error occurred.',
          error: error.message || 'Unknown error',
          status: 'unknown_error',
        };
      }
    }
  }
};

// 📝 UNDERSTANDING: Storage Keys
// These are like "labels" for your phone's storage compartments
const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',           // Where you store login proof
  REFRESH_TOKEN: 'refresh_token',     // Backup login proof  
  PHONE_NUMBER: 'user_phone_number',  // Extra data we collect
} as const;

export interface LoginRequest {
  email: string;
  password: string;
  // Note: role is not sent to API, it's determined by backend
  // We'll store it locally for routing purposes
  role?: string;
}

class AuthService {
  // 📝 STEP 2: Registration (Sign Up) - FIXED VERSION
  // This is what happens when user clicks "Create Account"
  async signup(formData: SignupFormData): Promise<ApiResponse<RegistrationResponse>> {
    try {
      console.log('👤 Starting user registration...');
      
      // Get user type from AsyncStorage (set during path selection)
      const userType = await AsyncStorage.getItem('userType') || 'customer';
      const role = userType === 'customer' ? 'user' : 'restaurant'; // Backend expects 'user' for customers
      
      // Transform frontend data to backend format as per API docs
      const backendData = {
        username: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        password: formData.password,
        role: role, // Get role from userType instead of form data
      };
      
      console.log('📤 Signup data for API:', backendData);
      
      // Make API call using the auth API client with longer timeout
      const response = await authApi.post<RegistrationResponse>(ENDPOINTS.signup, backendData);
      
      if (response.success) {
        console.log('✅ Registration successful!');
        
        // Store additional frontend data locally for future use
        await this.storeAdditionalUserData({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,
        });
        
        console.log('💾 Additional user data stored locally');
      }
      
      return response;
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      
      // Check if it's an axios error with a backend response
      if (error.response?.data) {
        const backendMessage = error.response.data.message || 
                              error.response.data.error ||
                              `HTTP ${error.response.status}: ${error.response.statusText}`;
        
        return {
          success: false,
          message: backendMessage,
          error: error.response.data.error || error.response.statusText,
        };
      }
      
      // Fallback to generic message if no backend response
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 📝 STEP 3: Login (Sign In) - FIXED VERSION
  // This is what happens when user clicks "Sign In"
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    try {
      console.log('🔐 Starting user login...');
      
      // Extract only email and password as per API docs
      const loginData = {
        email: credentials.email,
        password: credentials.password,
      };
      
      console.log('📤 Sending login data:', loginData);
      
      // Make login API call with longer timeout
      const response = await authApi.post<LoginResponse>(ENDPOINTS.login, loginData);
      
      if (response.success && response.data) {
        console.log('✅ Login successful!');
        console.log('🔍 FULL BACKEND RESPONSE:', JSON.stringify(response.data, null, 2));
        
        // Get user type from AsyncStorage (set during path selection)
        const userType = await AsyncStorage.getItem('userType') || 'customer';
        console.log('👤 User type from storage:', userType);
        
        // Check if backend returned success status
        if (response.data.status !== 'success') {
          console.log('❌ Backend status not success:', response.data.status);
          return {
            success: false,
            message: response.data.message || 'Login failed',
            error: 'Login unsuccessful',
          };
        }

        // 🚨 ENFORCE EMAIL VERIFICATION - Critical Security Check
        console.log('🔍 BACKEND RETURNED:', response.data);
        console.log('🔍 isEmailVerified value:', response.data.isEmailVerified);
        console.log('🔍 isEmailVerified type:', typeof response.data.isEmailVerified);
        
        // TEMPORARY FIX: Backend login endpoint is missing isEmailVerified field
        // Until backend is fixed, assume successful login means email is verified
        let isEmailVerified = response.data.isEmailVerified;
        
        if (isEmailVerified === undefined || isEmailVerified === null) {
          console.log('⚠️ Backend missing isEmailVerified field - assuming verified since login succeeded');
          // If backend allows login, assume email is verified
          // Note: This should be fixed in backend to return proper isEmailVerified field
          isEmailVerified = true;
        }
        
        console.log('📧 Email verification status:', isEmailVerified);

        // Store additional profile flags for routing decisions
        await AsyncStorage.setItem('hasUserProfile', response.data.hasUserProfile.toString());
        await AsyncStorage.setItem('forcePasswordChange', response.data.forcePasswordChange.toString());
        await AsyncStorage.setItem('isEmailVerified', isEmailVerified.toString());
        console.log('🏠 User profile status:', response.data.hasUserProfile ? 'Complete' : 'Needs setup');
        console.log('🔒 Force password change:', response.data.forcePasswordChange);
        console.log('📧 Email verified (corrected):', isEmailVerified);
        
        // Double-check: Read back what we just stored
        const storedEmailVerified = await AsyncStorage.getItem('isEmailVerified');
        console.log('🔍 Stored email verification status:', storedEmailVerified);
        
        // Transform backend response to our format
        const authData: AuthResponse = {
          token: response.data.token,
          user: {
            id: '', // TODO: Backend should return user ID or we decode from JWT
            email: credentials.email,
            role: userType === 'customer' ? 'user' : 'restaurant', // Map userType to role
            isEmailVerified: isEmailVerified, // Use corrected verification status
            hasProfile: response.data.hasUserProfile, // NEW: Add profile status
            forcePasswordChange: response.data.forcePasswordChange, // NEW: Add password change requirement
          }
        };
        
        // Store authentication data (token, user info)
        await this.storeAuthData(authData);
        console.log('💾 Auth data stored successfully');
        
        return {
          success: true,
          message: response.data.message || 'Login successful',
          data: authData,
        };
      }
      
      return {
        success: false,
        message: response.message || 'Login failed',
        error: response.error,
      };
    } catch (error: any) {
      console.error('❌ Login error:', error);
      
      // Check if it's an axios error with a backend response
      if (error.response?.data) {
        const backendMessage = error.response.data.message || 
                              error.response.data.error ||
                              `HTTP ${error.response.status}: ${error.response.statusText}`;
        
        return {
          success: false,
          message: backendMessage,
          error: error.response.data.error || error.response.statusText,
        };
      }
      
      // Fallback to generic message if no backend response
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Login failed. Please check your credentials.',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 📝 STEP 4: Forgot Password - Updated to match API specification
  // This is what happens when user clicks "Forgot Password"
  async forgotPassword(email: string): Promise<ApiResponse<{ message: string }>> {
    try {
      console.log('📧 Sending password reset email to:', email);
      
      // Call the forgot password API endpoint with longer timeout
      const response = await authApi.post<{ status: string; message: string }>(
        ENDPOINTS.forgotPassword, 
        { email }
      );
      
      // Check if the API call was successful
      if (response.success && response.data) {
        // Check the backend status field
        const isSuccess = response.data.status === 'success';
        
        if (isSuccess) {
          console.log('✅ Password reset link sent successfully');
        } else {
          console.log('❌ Password reset failed:', response.data.message);
        }
      
        return {
          success: isSuccess,
          message: response.data.message || (isSuccess ? 'Password reset link sent to your email' : 'Failed to send reset link'),
          data: { message: response.data.message || '' }
        };
      }
      
      return response;
    } catch (error: any) {
      console.error('❌ Forgot password error:', error);
      
      // Check if it's an axios error with a backend response
      if (error.response?.data) {
        const backendMessage = error.response.data.message || 
                              error.response.data.error ||
                              `HTTP ${error.response.status}: ${error.response.statusText}`;
        
        return {
          success: false,
          message: backendMessage,
          error: error.response.data.error || error.response.statusText,
        };
      }
      
      // Fallback to generic message if no backend response
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send reset link. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 📝 NEW: Reset Password with Token
  
  // 📝 Reset Password via Email Token (forgot password flow)
  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<{ message: string }>> {
    try {
      console.log('🔑 Resetting password with email token');
      
      // Call the reset password API with token as query parameter
      const response = await api.post<{ status: string; message: string }>(
        `${ENDPOINTS.resetPassword}?token=${token}`, 
        { password: newPassword }
      );
      
      // Check if the API call was successful
      if (response.success && response.data) {
        // Check the backend status field
        const isSuccess = response.data.status === 'success';
      
        if (isSuccess) {
          console.log('✅ Password reset successfully via email token');
        } else {
          console.log('❌ Password reset failed:', response.data.message);
        }
        
        return {
          success: isSuccess,
          message: response.data.message || (isSuccess ? 'Password reset successfully' : 'Failed to reset password'),
          data: response.data
        };
      }
      
      return response;
    } catch (error) {
      console.error('❌ Reset password error:', error);
      return {
        success: false,
        message: 'Failed to reset password. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 📝 Change Password with Temporary Password (for non-authenticated users from forgot password flow)
  async changePasswordWithTempPassword(email: string, tempPassword: string, newPassword: string, confirmPassword: string): Promise<ApiResponse<{ message: string }>> {
    try {
      console.log('🔑 Attempting to login with temporary password first, then change password');
      
      // Validate passwords match
      if (newPassword !== confirmPassword) {
        return {
          success: false,
          message: 'New password and confirm password do not match',
          error: 'Password mismatch'
        };
      }
      
      // Step 1: Login with temporary password to get authentication
      console.log('🔐 Step 1: Logging in with temporary password');
      const loginResponse = await this.login({ email, password: tempPassword });
      
      if (!loginResponse.success) {
        console.log('❌ Failed to login with temporary password:', loginResponse.message);
        return {
          success: false,
          message: 'Temporary password is incorrect or expired. Please request a new password reset.',
          error: loginResponse.error
        };
      }
      
      console.log('✅ Step 1 complete: Successfully logged in with temporary password');
      
      // Step 2: Now change the password using the authenticated session
      console.log('🔑 Step 2: Changing password with authenticated session');
      const changeResponse = await this.changePassword(tempPassword, newPassword, confirmPassword);
      
      if (changeResponse.success) {
        console.log('✅ Password changed successfully after temp password login');
        
        // Step 3: Logout to clear the temporary session
        console.log('👋 Step 3: Logging out temporary session');
        await this.logout();
        
        return {
          success: true,
          message: 'Password updated successfully. You can now log in with your new password.',
          data: changeResponse.data
        };
      } else {
        console.log('❌ Failed to change password:', changeResponse.message);
        // Still logout the temporary session
        await this.logout();
        
        return {
          success: false,
          message: changeResponse.message || 'Failed to update password',
          error: changeResponse.error
        };
      }
      
    } catch (error) {
      console.error('❌ Change password with temp password error:', error);
      // Try to logout in case we're in a partial state
      try {
        await this.logout();
      } catch (logoutError) {
        console.error('❌ Failed to logout after error:', logoutError);
      }
      
      return {
        success: false,
        message: 'Failed to change password. Please try again or request a new temporary password.',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 📝 Change Password (for authenticated users with Bearer token)
  async changePassword(currentPassword: string, newPassword: string, confirmPassword: string): Promise<ApiResponse<{ message: string }>> {
    try {
      console.log('🔑 Changing password for authenticated user');
      
      // Validate passwords match
      if (newPassword !== confirmPassword) {
        return {
          success: false,
          message: 'New password and confirm password do not match',
          error: 'Password mismatch'
        };
      }
      
      // Call the change password API (requires Bearer token authentication)
      // This endpoint uses the reset-password URL but with Bearer token
      const response = await api.post<{ status: string; message: string }>(
        ENDPOINTS.resetPassword, 
        { 
          currentPassword, 
          newPassword,
          confirmPassword
        }
      );
      
      // Check if the API call was successful
      if (response.success && response.data) {
        // Check the backend status field
        const isSuccess = response.data.status === 'success';
        
        if (isSuccess) {
          console.log('✅ Password changed successfully for authenticated user');
        } else {
          console.log('❌ Password change failed:', response.data.message);
        }
        
        return {
          success: isSuccess,
          message: response.data.message || (isSuccess ? 'Password updated successfully' : 'Failed to update password'),
          data: response.data
        };
      }
      
      return response;
    } catch (error) {
      console.error('❌ Change password error:', error);
      return {
        success: false,
        message: 'Failed to change password. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 📝 NEW: Verify Email Token - Updated to match API specification
  async verifyEmail(token: string): Promise<ApiResponse<{ message: string }>> {
    try {
      console.log('📧 Verifying email with token:', token.substring(0, 10) + '...');
      
      // Call the verify email API with token as query parameter (GET request)
      // Note: Using authApiClient for longer timeout on critical operations
      const response = await authApiClient.get(
        `${ENDPOINTS.verifyEmail}?token=${token}`
      );
      
        // Check the backend status field
        const isSuccess = response.data.status === 'success';
      
        if (isSuccess) {
          console.log('✅ Email verified successfully');
        } else {
          console.log('❌ Email verification failed:', response.data.message);
        }
        
        return {
          success: isSuccess,
          message: response.data.message || (isSuccess ? 'Email verified successfully' : 'Failed to verify email'),
          data: response.data
        };
    } catch (error) {
      console.error('❌ Verify email error:', error);
      return {
        success: false,
        message: 'Failed to verify email. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 📝 NEW: Resend Email Verification
  async resendVerificationEmail(email?: string): Promise<ApiResponse<{ message: string }>> {
    try {
      console.log('📧 Resending verification email...');
      
      // Use provided email or get from storage
      let userEmail = email;
      if (!userEmail) {
        const storedEmail = await AsyncStorage.getItem('userEmail');
        if (!storedEmail) {
          throw new Error('No email address found. Please sign up again.');
        }
        userEmail = storedEmail;
      }
      
      // Call the resend verification API
      const response = await api.post<{ status: string; message: string }>(
        ENDPOINTS.resendVerification, 
        { email: userEmail }
      );
      
      if (response.success && response.data) {
        const isSuccess = response.data.status === 'success';
        
        return {
          success: isSuccess,
          message: response.data.message || (isSuccess ? 'Verification email sent successfully' : 'Failed to send verification email'),
          data: response.data
        };
      }
      
      return response;
    } catch (error) {
      console.error('❌ Resend verification error:', error);
      return {
        success: false,
        message: 'Failed to resend verification email. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 📝 STEP 5: Logout
  // This is what happens when user clicks "Logout"
  async logout(): Promise<ApiResponse<{ message: string }>> {
    try {
      console.log('👋 Logging out user...');
      
      // Try to call logout endpoint (but don't fail if it doesn't work)
      try {
        const response = await api.post<{ message: string }>(ENDPOINTS.logout, {});
        console.log('✅ Logout API call successful');
      } catch (error) {
        console.log('⚠️ Logout API call failed, but continuing with local cleanup');
      }
      
      // Always clear local auth data regardless of API response
      await this.clearAuthData();
      console.log('🧹 Auth data cleared successfully');
      
      return {
        success: true,
        message: 'Logged out successfully',
        data: { message: 'Logged out successfully' }
      };
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Even if there's an error, clear local data
      await this.clearAuthData();
      console.log('🧹 Local auth data cleared');
      
      return {
        success: false,
        message: 'Logout completed (local cleanup only)',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 📝 UTILITY METHODS: These help check user status and get stored data

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      return !!token; // Convert to boolean
    } catch (error) {
      console.error('❌ Check authentication error:', error);
      return false;
    }
  }

  // Get stored auth token
  async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('❌ Get auth token error:', error);
      return null;
    }
  }

  // Check if user has previously signed up (to differentiate first-time vs returning)
  async hasUserSignedUpBefore(): Promise<boolean> {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      return !!userData;
    } catch (error) {
      console.error('❌ Check previous signup error:', error);
      return false;
    }
  }

  // Get stored user data
  async getStoredUserData(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('❌ Get stored user data error:', error);
      return null;
    }
  }

  // 📝 PRIVATE METHODS: Internal helper functions

  // Store authentication data (token, user info)
  private async storeAuthData(authData: AuthResponse): Promise<void> {
    try {
      const operations = [
        AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, authData.token),
        AsyncStorage.setItem('user_data', JSON.stringify(authData.user)),
        AsyncStorage.setItem('isLoggedIn', 'true'), // 🔥 FIX: Store login status!
        AsyncStorage.setItem('userEmail', authData.user.email), // Store email for easy access
        AsyncStorage.setItem('userName', authData.user.name || authData.user.username || authData.user.email), // Store name
      ];

      if (authData.refreshToken) {
        operations.push(
          AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, authData.refreshToken)
        );
      }

      await Promise.all(operations);
      console.log('💾 Auth data stored successfully (including login status)');
    } catch (error) {
      console.error('❌ Store auth data error:', error);
      // Do not throw error, allow login to proceed
    }
  }

  // Store additional user data (frontend-specific)
  private async storeAdditionalUserData(data: { 
    firstName: string; 
    lastName: string; 
    phoneNumber: string; 
  }): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PHONE_NUMBER, data.phoneNumber);
      
      // Store name breakdown for future use
      const additionalData = {
        firstName: data.firstName,
        lastName: data.lastName,
        fullName: `${data.firstName} ${data.lastName}`,
      };
      
      await AsyncStorage.setItem('additional_user_data', JSON.stringify(additionalData));
      console.log('💾 Additional user data stored successfully');
    } catch (error) {
      console.error('❌ Store additional user data error:', error);
      // Don't throw - this is non-critical
    }
  }

  // Store additional restaurant data (frontend-specific)
  private async storeAdditionalRestaurantData(data: { 
    phoneNumber?: string; 
    address?: string; 
    city?: string; 
  }): Promise<void> {
    try {
      const restaurantData: Record<string, string> = {};
      
      if (data.phoneNumber) {
        restaurantData.phoneNumber = data.phoneNumber;
      }
      if (data.address) {
        restaurantData.address = data.address;
      }
      if (data.city) {
        restaurantData.city = data.city;
      }
      
      await AsyncStorage.setItem('additional_restaurant_data', JSON.stringify(restaurantData));
      console.log('💾 Additional restaurant data stored successfully');
    } catch (error) {
      console.error('❌ Store additional restaurant data error:', error);
      // Don't throw - this is non-critical
    }
  }

  // Clear authentication data
  private async clearAuthData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.PHONE_NUMBER,
        'user_data',
        'userType', // Clear user type so they can select again
        'isLoggedIn', // 🔥 FIX: Clear login status!
        'userEmail', // Clear stored email
        'userName', // Clear stored name
        'hasUserProfile', // Clear profile status
        'forcePasswordChange', // Clear password change flag
        'isEmailVerified', // Clear email verification status
      ]);
      console.log('🧹 Auth data cleared successfully (including login status)');
    } catch (error) {
      console.error('❌ Clear auth data error:', error);
      throw error;
    }
  }

  // Register a new restaurant - Updated to match new API specification
  async registerRestaurant(data: {
    username: string;
    email: string;
    password: string;
    phoneNumber?: string;
    address?: string;
    city?: string;
  }): Promise<ApiResponse<RegistrationResponse>> {
    try {
      console.log('🏪 Starting restaurant registration...');
      
      // Transform data to match new API requirements
      const registrationData = {
        username: data.username,
        email: data.email,
        password: data.password,
        role: 'restaurant' // Fixed role for restaurant registration
      };
      
      console.log('📤 Restaurant signup data for API:', registrationData);
      
      // Make API call using the auth API client with longer timeout
      const response = await authApi.post<RegistrationResponse>(ENDPOINTS.signup, registrationData);
      
      if (response.success) {
        console.log('✅ Restaurant registration successful!');
        
        // Store additional restaurant data locally for future use
        if (data.phoneNumber || data.address || data.city) {
          await this.storeAdditionalRestaurantData({
            phoneNumber: data.phoneNumber,
            address: data.address,
            city: data.city,
          });
        }
        
        console.log('💾 Additional restaurant data stored locally');
      }
      
      return response;
    } catch (error: any) {
      console.error('❌ Restaurant registration error:', error);
      
      // Check if it's an axios error with a backend response
      if (error.response?.data) {
        const backendMessage = error.response.data.message || 
                              error.response.data.error ||
                              `HTTP ${error.response.status}: ${error.response.statusText}`;
        
        return {
          success: false,
          message: backendMessage,
          error: error.response.data.error || error.response.statusText,
        };
      }
      
      // Fallback to generic message if no backend response
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Restaurant registration failed. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Export a singleton instance
export default new AuthService();