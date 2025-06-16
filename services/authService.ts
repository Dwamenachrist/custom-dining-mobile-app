import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, ApiResponse, SignupRequest, SignupFormData, LoginRequest, AuthResponse, RegistrationResponse } from './api';
import { ENDPOINTS } from './config';

// 📝 UNDERSTANDING: Storage Keys
// These are like "labels" for your phone's storage compartments
const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',           // Where you store login proof
  REFRESH_TOKEN: 'refresh_token',     // Backup login proof  
  PHONE_NUMBER: 'user_phone_number',  // Extra data we collect
} as const;

class AuthService {
  // 📝 STEP 1: Data Transformation Function
  // This converts what the user typed into what the backend expects
  private transformSignupData(formData: SignupFormData): SignupRequest {
    console.log('🔄 Transforming frontend data to backend format...');
    
    const backendData = {
      // Combine first and last name for username
      username: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email,
      password: formData.password,
      role: formData.role,
    };
    
    console.log('📤 Frontend data:', formData);
    console.log('📦 Backend data:', backendData);
    
    return backendData;
  }

  // 📝 STEP 2: Registration (Sign Up)
  // This is what happens when user clicks "Create Account"
  async signup(formData: SignupFormData): Promise<ApiResponse<RegistrationResponse>> {
    try {
      console.log('👤 Starting user registration...');
      
      // Transform frontend data to backend format
      const backendData = this.transformSignupData(formData);
      
      // Make API call using our new Axios service
      const response = await api.post<RegistrationResponse>(ENDPOINTS.signup, backendData);
      
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
    } catch (error) {
      console.error('❌ Registration error:', error);
      return {
        success: false,
        message: 'Registration failed. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 📝 STEP 3: Login (Sign In) - ORIGINAL VERSION
  // This is what happens when user clicks "Sign In"
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    try {
      console.log('🔐 Starting user login...');
      console.log('📤 Sending login data (WITHOUT role):', credentials);
      
      // Make login API call
      const response = await api.post<AuthResponse>(ENDPOINTS.login, credentials);
      
      if (response.success && response.data) {
        console.log('✅ Login successful!');
        
        // Store authentication data (token, user info)
        await this.storeAuthData(response.data);
        console.log('💾 Auth data stored successfully');
      }
      
      return response;
    } catch (error) {
      console.error('❌ Login error:', error);
      return {
        success: false,
        message: 'Login failed. Please check your credentials.',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 📝 STEP 4: Forgot Password (Original email-based)
  // This is what happens when user clicks "Forgot Password"
  async forgotPassword(email: string): Promise<ApiResponse<{ message: string }>> {
    try {
      console.log('📧 Sending password reset email...');
      
      // Use POST as the server expects a POST for forgot-password
      const response = await api.post<{ message: string }>(ENDPOINTS.forgotPassword, { email });
      
      if (response.success) {
        console.log('✅ Password reset email sent');
      }
      
      return {
        success: response.success,
        message: response.message || 'Password reset email sent successfully',
        data: response.data
      };
    } catch (error) {
      console.error('❌ Forgot password error:', error);
      return {
        success: false,
        message: 'Failed to send reset email. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 📝 NEW: Send OTP to Mobile Number
  async sendOTPToMobile(phoneNumber: string): Promise<ApiResponse<{ message: string }>> {
    try {
      console.log('📱 Sending OTP to mobile:', phoneNumber);
      
      const response = await api.post<{ message: string }>(ENDPOINTS.sendOTPMobile, { 
        phoneNumber 
      });
      
      if (response.success) {
        console.log('✅ OTP sent to mobile successfully');
      }
      
      return response;
    } catch (error) {
      console.error('❌ Send OTP to mobile error:', error);
      return {
        success: false,
        message: 'Failed to send OTP to mobile. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 📝 NEW: Send OTP to Email
  async sendOTPToEmail(email: string): Promise<ApiResponse<{ message: string }>> {
    try {
      console.log('📧 Sending OTP to email:', email);
      
      const response = await api.post<{ message: string }>(ENDPOINTS.sendOTPEmail, { 
        email 
      });
      
      if (response.success) {
        console.log('✅ OTP sent to email successfully');
      }
      
      return response;
    } catch (error) {
      console.error('❌ Send OTP to email error:', error);
      return {
        success: false,
        message: 'Failed to send OTP to email. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 📝 NEW: Verify OTP
  async verifyOTP(
    contact: string, 
    otp: string, 
    method: 'mobile' | 'email'
  ): Promise<ApiResponse<{ resetToken: string; message: string }>> {
    try {
      console.log('🔐 Verifying OTP:', { contact, otp, method });
      
      const response = await api.post<{ resetToken: string; message: string }>(
        ENDPOINTS.verifyOTP, 
        { 
          contact, 
          otp, 
          method 
        }
      );
      
      if (response.success) {
        console.log('✅ OTP verified successfully');
      }
      
      return response;
    } catch (error) {
      console.error('❌ Verify OTP error:', error);
      return {
        success: false,
        message: 'Invalid verification code. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 📝 NEW: Reset Password with Token
  async resetPassword(
    token: string, 
    newPassword: string
  ): Promise<ApiResponse<{ message: string }>> {
    try {
      console.log('🔑 Resetting password with token');
      
      const response = await api.post<{ message: string }>(ENDPOINTS.resetPassword, { 
        token, 
        newPassword 
      });
      
      if (response.success) {
        console.log('✅ Password reset successfully');
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

  // 📝 STEP 5: Logout
  // This is what happens when user clicks "Sign Out"
  async logout(): Promise<ApiResponse<{ message: string }>> {
    try {
      console.log('👋 Logging out user...');
      
      // Try to call logout endpoint (optional - depends on backend)
      const response = await api.post<{ message: string }>(ENDPOINTS.logout);
      
      // Clear stored data regardless of API response
      await this.clearAuthData();
      console.log('🧹 Local auth data cleared');
      
      return {
        success: true,
        message: 'Logged out successfully',
      };
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Still clear local data even if API call fails
      await this.clearAuthData();
      
      return {
        success: true, // Return success since local logout succeeded
        message: 'Logged out successfully',
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

  // Register a new restaurant
  async registerRestaurant(data: any): Promise<ApiResponse<any>> {
    try {
      const response = await api.post(ENDPOINTS.restaurants, data);
      return response;
    } catch (error) {
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