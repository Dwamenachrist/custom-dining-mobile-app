import axios from 'axios';
import { getApiUrl, API_CONFIG } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 📝 STEP 1: Define TypeScript interfaces
// These help you understand what data structure to expect

// API response types - Updated to match backend
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  // Backend actually returns:
  status?: string;    // Backend uses "status" field
}

// User types
export interface User {
  id: string;
  name?: string;        // Backend might use "name" 
  username?: string;    // or "username"
  email: string;
  role: string;         // Backend requires role
  isAdmin?: boolean;    // Backend has isAdmin field
  createdAt?: string;
}

// Meal types - matching backend structure
export interface Meal {
  id: number;
  name: string;
  description: string;
  dietaryTags: string[];
  nutritionalInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  allergens: string[];
  restaurantId: string | null;
  createdAt: string;
  updatedAt: string;
}

// Updated to match backend requirements
export interface SignupRequest {
  username: string;     // Backend uses "username"
  email: string;
  password: string;
  role: string;         // Required by backend
}

// Our frontend form data (before transformation)
export interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  // role: string; // Removed - role is determined from userType in AsyncStorage
}

export interface LoginRequest {
  email: string;
  password: string;
  // Note: role is not sent to API, it's determined by backend
  // We'll store it locally for routing purposes
  role?: string;
}

// Backend registration response (based on docs)
export interface RegistrationResponse {
  status: string;
  message: string;
  // Note: Registration doesn't seem to return token immediately
}

// Login response (assumed - we'll need to check login endpoint)
export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

// 📝 STEP 2: Create Axios instance
// Think of this as creating your "HTTP client" with default settings
const apiClient = axios.create({
  baseURL: getApiUrl(),           // Your backend URL: http://localhost:3006/api
  timeout: API_CONFIG.timeout,    // 10 seconds timeout
  headers: API_CONFIG.defaultHeaders, // JSON headers
});

// 📝 STEP 3: Request Interceptor (THE MAGIC!)
// This runs BEFORE every request - automatically adds auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Get stored auth token
      const token = await AsyncStorage.getItem('auth_token');
      
      if (token) {
        // Automatically add Authorization header to EVERY request
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔑 Added auth token to request');
      }
      
      // Log what you're sending (helpful for debugging)
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
      if (config.data) {
        console.log('📤 Request Data:', config.data);
      }
      
      return config;
    } catch (error) {
      console.warn('Failed to get auth token:', error);
      return config;
    }
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// 📝 STEP 4: Response Interceptor 
// This runs AFTER every response - handles common scenarios
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses
    console.log(`✅ Response: ${response.status}`, response.data);
    return response;
  },
  async (error) => {
    console.error(`❌ API Error: ${error.response?.status}`, error.response?.data);
    
    // Handle 401 Unauthorized (token expired)
    if (error.response?.status === 401) {
      console.log('🔐 Token expired, clearing auth data');
      // Automatically clear expired tokens
      await AsyncStorage.multiRemove(['auth_token', 'user_data']);
      // Here you could emit an event to redirect to login
    }
    
    return Promise.reject(error);
  }
);

// 📝 STEP 5: API Methods
// These are your "tools" for making different types of requests

class ApiService {
  // GET request - for retrieving data
  static async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.get(endpoint);
      
      // Backend returns data directly (like arrays for /meals), not wrapped
      return {
        success: true,
        message: 'Success',
        data: response.data, // Use response.data directly
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // POST request - for creating/sending data
  static async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.post(endpoint, data);
      
      // Handle backend response format: { status: "success", token: "...", message: "..." }
      const isSuccess = response.data.status === 'success';
      
      return {
        success: isSuccess,
        message: response.data.message || (isSuccess ? 'Success' : 'Request failed'),
        data: response.data, // Return the full response data
        status: response.data.status,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // PUT request - for updating data
  static async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.put(endpoint, data);
      
      return {
        success: true,
        message: response.data.message || 'Success',
        data: response.data.data || response.data,
        status: response.data.status,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // DELETE request - for deleting data
  static async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.delete(endpoint);
      
      return {
        success: true,
        message: response.data.message || 'Success',
        data: response.data.data || response.data,
        status: response.data.status,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // 📝 STEP 6: Centralized Error Handling
  // One place to handle all API errors consistently
  private static handleError(error: any): ApiResponse<any> {
    console.error('🚨 API Request Failed:', error);
    
    // Check if it's an Axios error (has response)
    if (error.response) {
      // Server responded with error status
      return {
        success: false,
        message: error.response.data?.message || 
                `HTTP ${error.response.status}: ${error.response.statusText}`,
        error: error.response.data?.error || error.response.statusText,
        status: error.response.data?.status || 'error',
      };
    } else if (error.request) {
      // Network error - no response received
      return {
        success: false,
        message: 'Network error. Please check your connection.',
        error: 'No response from server',
        status: 'network_error',
      };
    } else {
      // Something else went wrong
      return {
        success: false,
        message: 'An unexpected error occurred.',
        error: error.message || 'Unknown error',
        status: 'unknown_error',
      };
    }
  }
}

// 📝 STEP 7: Export clean API interface
// This gives you simple methods to use: api.get(), api.post(), etc.
export const api = {
  get: <T>(endpoint: string) => ApiService.get<T>(endpoint),
  post: <T>(endpoint: string, data?: any) => ApiService.post<T>(endpoint, data),
  put: <T>(endpoint: string, data?: any) => ApiService.put<T>(endpoint, data),
  delete: <T>(endpoint: string) => ApiService.delete<T>(endpoint),
};

// Export the Axios instance in case you need advanced features
export { apiClient };

// Restaurant-specific API functions
export async function addMealToRestaurant(data: {
  restaurantId: string;
  jwt: string;
  name: string;
  description: string;
  price: number;
  dietaryTags: string[];
  category?: string;
  nutrition?: any;
  days?: string[];
  timeSlot?: string;
  image?: string;
}): Promise<ApiResponse<any>> {
  try {
    const { restaurantId, jwt, ...mealData } = data;
    
    // Only send required fields to backend as per API docs
    const payload = {
      name: mealData.name,
      description: mealData.description,
      price: mealData.price,
      dietaryTags: mealData.dietaryTags,
    };

    console.log('🍽️ Adding meal to restaurant:', restaurantId, payload);
    
    const response = await api.post('/meals', payload);
    
    if (response.success) {
      console.log('✅ Meal added successfully!');
    }
    
    return response;
  } catch (error) {
    console.error('❌ Add meal error:', error);
    throw error;
  }
}

// Get all meals for menu snapshot
export async function getAllMeals(): Promise<ApiResponse<Meal[]>> {
  try {
    console.log('🍽️ Fetching all meals for menu snapshot');
    
    const response = await api.get<Meal[]>('/meals');
    
    if (response.success) {
      console.log('✅ Meals fetched successfully!');
    }
    
    return response;
  } catch (error) {
    console.error('❌ Get meals error:', error);
    throw error;
  }
}

export default ApiService; 