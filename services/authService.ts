import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, ApiResponse, SignupRequest, SignupFormData, AuthResponse, RegistrationResponse, apiClient } from './api';
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
      const role = userType === 'customer' ? 'user' : 'admin';
      
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
      const response = await authApi.post<{ status: string; token: string }>(ENDPOINTS.login, loginData);
      
      if (response.success && response.data) {
        console.log('✅ Login successful!');
        
        // Get user type from AsyncStorage (set during path selection)
        const userType = await AsyncStorage.getItem('userType') || 'customer';
        console.log('👤 User type from storage:', userType);
        
        // Transform backend response to our format
        const authData: AuthResponse = {
          token: response.data.token,
          user: {
            id: '', // We'll need to decode token or get user info separately
            email: credentials.email,
            role: userType === 'customer' ? 'user' : 'admin', // Map userType to role
          }
        };
        
        // Store authentication data (token, user info)
        await this.storeAuthData(authData);
        console.log('💾 Auth data stored successfully');
        
        return {
          success: true,
          message: 'Login successful',
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

  // 📝 STEP 4: Forgot Password (Email-based reset link)
  // This is what happens when user clicks "Forgot Password"
  async forgotPassword(email: string): Promise<ApiResponse<{ message: string; temporaryPassword?: string }>> {
    try {
      console.log('📧 Sending password reset email...');
      
      // Call the forgot password API endpoint with longer timeout
      const response = await authApi.post<{ status: string; message: string; temporaryPassword?: string; tempPassword?: string; temporary_password?: string }>(ENDPOINTS.forgotPassword, { email });
      
      // Check if the API call was successful
      if (response.success && response.data) {
        // Check the backend status field
        const isSuccess = response.data.status === 'success';
        
        if (isSuccess) {
          console.log('✅ Password reset link sent successfully');
          
          // Extract temporary password from various possible field names
          const temporaryPassword = response.data.temporaryPassword || 
                                   response.data.tempPassword || 
                                   response.data.temporary_password;
          
          if (temporaryPassword) {
            console.log('🔑 Temporary password received from backend');
          }
        } else {
          console.log('❌ Password reset failed:', response.data.message);
        }
      
        return {
          success: isSuccess,
          message: response.data.message || (isSuccess ? 'Password reset link sent successfully' : 'Failed to send reset link'),
          data: {
            message: response.data.message || '',
            temporaryPassword: response.data.temporaryPassword || 
                              response.data.tempPassword || 
                              response.data.temporary_password
          }
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
  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<{ message: string }>> {
    try {
      console.log('🔑 Resetting password with token');
      
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
          console.log('✅ Password reset successfully');
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

  // 📝 NEW: Change Password (for logged-in users)
  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<{ message: string }>> {
    try {
      console.log('🔑 Changing password for logged-in user');
      
      // Call the change password API (requires authentication)
      const response = await api.post<{ status: string; message: string }>(
        ENDPOINTS.changePassword, 
        { 
          currentPassword, 
          newPassword 
        }
      );
      
      // Check if the API call was successful
      if (response.success && response.data) {
        // Check the backend status field
        const isSuccess = response.data.status === 'success';
        
        if (isSuccess) {
          console.log('✅ Password changed successfully');
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

  // 📝 NEW: Verify Email Token
  async verifyEmail(token: string): Promise<ApiResponse<{ message: string }>> {
    try {
      console.log('📧 Verifying email with token');
      
      // Call the verify email API with token as query parameter
      const response = await api.get<{ status: string; message: string }>(
        `${ENDPOINTS.verifyEmail}?token=${token}`
      );
      
      // Check if the API call was successful
      if (response.success && response.data) {
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
      }
      
      return response;
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
        userEmail = await AsyncStorage.getItem('userEmail') || undefined;
        if (!userEmail) {
          throw new Error('No email address found. Please sign up again.');
        }
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

  // 📝 PRIVATE METHODS: Internal helper functions

  // Store authentication data (token, user info)
  private async storeAuthData(authData: AuthResponse): Promise<void> {
    try {
      const operations = [
        AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, authData.token),
      ];

      if (authData.refreshToken) {
        operations.push(
          AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, authData.refreshToken)
        );
      }

      await Promise.all(operations);
      console.log('💾 Auth data stored successfully');
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

  // Clear authentication data
  private async clearAuthData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.PHONE_NUMBER,
      ]);
      console.log('🧹 Auth data cleared successfully');
    } catch (error) {
      console.error('❌ Clear auth data error:', error);
      throw error;
    }
  }

  // Register a new restaurant - UPDATED
  async registerRestaurant(data: any): Promise<ApiResponse<any>> {
    try {
      console.log('🏪 Starting restaurant registration...');
      
      // NOTE: The API docs don't show a restaurant signup endpoint
      // For now, we'll simulate a successful restaurant registration
      // In production, you'll need to implement the actual restaurant signup endpoint
      
      console.log('📤 Restaurant signup data:', data);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('✅ Restaurant registration successful! (simulated)');
      
      return {
        success: true,
        message: 'Restaurant account created successfully!',
        data: {
          status: 'success',
          message: 'Restaurant account created successfully!'
        }
      };
    } catch (error) {
      console.error('❌ Restaurant registration error:', error);
      return {
        success: false,
        message: 'Failed to register restaurant. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Export a singleton instance
export default new AuthService();