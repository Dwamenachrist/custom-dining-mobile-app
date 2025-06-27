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
  isEmailVerified?: boolean; // Email verification status
  hasProfile?: boolean; // Whether user has completed dietary preferences setup
  forcePasswordChange?: boolean; // Whether user must change password
  restaurantId?: string; // For restaurant users
  createdAt?: string;
}

// Meal types - matching backend structure
export interface Meal {
  id: string;  // Backend uses string IDs, not numbers
  name: string;
  description: string;
  price: string;  // Backend returns price as string
  isAvailable: number;  // Backend uses 1/0 for boolean
  restaurantId: string;
  createdAt: string;
  updatedAt: string;
  dietaryTags: string[];
  allergens: string[];
  nutritionalInfo: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    sugars?: number;
    fiber?: number;
    sodium?: number;
  };
  restaurant?: {
    id: string;
    name: string;
    location: string;
  };
  image?: any;  // For hybrid meals with local images
}

// Updated to match backend requirements
export interface SignupRequest {
  username: string;     // Backend uses "username"
  email: string;
  password: string;
  role: string;         // Required by backend
}

// Restaurant registration request
export interface RestaurantRegistrationRequest {
  username: string;     // Business name
  email: string;
  password: string;
  role: 'restaurant';   // Fixed role for restaurants
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

// Backend registration response (based on API docs)
export interface RegistrationResponse {
  status: string; // "success" or "error"
  message: string; // "Registration successful! Please check your email to verify your account."
}

// Login response (updated based on new backend format)
export interface LoginResponse {
  status: string;              // "success" or "error"
  token: string;               // JWT token
  role: string;                // User role: "user" or "restaurant"
  forcePasswordChange: boolean; // Whether user must change password
  hasUserProfile: boolean;     // Whether user has completed dietary preferences setup
  isEmailVerified?: boolean;   // Whether user has verified their email (optional)
  message?: string;            // Optional response message
}

// Auth data that we store locally (enhanced with user info)
export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

// Add dietary preference types based on your API
export interface DietaryPreferences {
  healthGoal: string;  // e.g., "weight_loss", "muscle_gain", "balanced_nutrition"
  dietaryRestrictions: string[];  // e.g., ["vegetarian", "gluten-free"]
  preferredMealTags: string[];   // e.g., ["high-protein", "low-carb"]
}

// Meal plan builder data structure
export interface MealPlanData {
  mealGoal: string;
  planDuration: string;
  restrictions: string[];
  disliked: string;
  meals: Array<{
    type: string;
    name: string;
    image: any;
  }>;
}

// Restaurant types
export interface Restaurant {
  restaurantId: string;  // Backend uses 'restaurantId', not 'id'
  restaurantName: string;  // Backend uses 'restaurantName', not 'name'
  location: string;
  cuisineType: string;
  contactEmail: string;
  status: string;
  isActive: boolean;
  owner: {
    id: string;
    username: string;
    email: string;
  };
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

  // POST request - for creating/sending data (with 503 retry logic)
  static async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    const maxRetries = 3;
    const retryDelay = 3000; // 3 seconds
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`🔄 Retry attempt ${attempt}/${maxRetries} for cold start`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
        
        const response = await apiClient.post(endpoint, data);
        
        // Handle backend response format: { status: "success", token: "...", message: "..." }
        const isSuccess = response.data.status === 'success';
        
        return {
          success: isSuccess,
          message: response.data.message || (isSuccess ? 'Success' : 'Request failed'),
          data: response.data, // Return the full response data
          status: response.data.status,
        };
      } catch (error: any) {
        // Check if it's a 503 error (cold start) and we can retry
        if (error.response?.status === 503 && attempt < maxRetries) {
          console.log(`🌡️ Server cold start detected (503) - attempt ${attempt + 1}/${maxRetries + 1}`);
          continue;
        }
        
        // Not a retryable error or max retries reached
        return this.handleError(error);
      }
    }
    
    // This should never be reached
    return this.handleError(new Error('Max retries exceeded'));
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
      const errorData = error.response.data;
      
      // Try to extract meaningful error message from various possible backend response formats
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
      // Network error - no response received
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
        error: 'No response from server',
        status: 'network_error',
      };
    } else {
      // Something else went wrong
      return {
        success: false,
        message: error.message || 'An unexpected error occurred.',
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

// Get all meals from the backend
export async function getAllMeals(): Promise<ApiResponse<Meal[]>> {
  try {
    console.log('🍽️ Fetching all meals');
    
    const response = await apiClient.get('/meals');
    
    // Backend returns: { status: 'success', results: number, data: Meal[] }
    if (response.data.status === 'success' && response.data.data) {
      console.log('✅ Meals fetched successfully!', response.data);
      return {
        success: true,
        message: 'Meals fetched successfully',
        data: response.data.data, // Extract the data array
      };
    } else {
      console.log('⚠️ No meals found in response');
      return {
        success: false,
        message: 'No meals found',
        data: [],
      };
    }
  } catch (error) {
    console.error('❌ Get meals error:', error);
    return {
      success: false,
      message: 'Failed to fetch meals',
      error: error instanceof Error ? error.message : 'Unknown error',
      data: [],
    };
  }
}

// Get all restaurants from the backend
export async function getAllRestaurants(): Promise<ApiResponse<Restaurant[]>> {
  try {
    console.log('🏪 Fetching all restaurants');
    
    const response = await apiClient.get('/restaurants');
    
    // Backend returns: { status: 'success', results: number, data: { restaurants: Restaurant[] } }
    if (response.data.status === 'success' && response.data.data && response.data.data.restaurants) {
      console.log('✅ Restaurants fetched successfully!', response.data);
      return {
        success: true,
        message: 'Restaurants fetched successfully',
        data: response.data.data.restaurants, // Extract the restaurants array
      };
    } else {
      console.log('⚠️ No restaurants found in response');
      return {
        success: false,
        message: 'No restaurants found',
        data: [],
      };
    }
  } catch (error) {
    console.error('❌ Get restaurants error:', error);
    return {
      success: false,
      message: 'Failed to fetch restaurants',
      error: error instanceof Error ? error.message : 'Unknown error',
      data: [],
    };
  }
}

// Get restaurant by ID
export async function getRestaurantById(restaurantId: string): Promise<ApiResponse<Restaurant>> {
  try {
    console.log('🏪 Fetching restaurant by ID:', restaurantId);
    
    const response = await api.get<Restaurant>(`/restaurants/${restaurantId}`);
    
    if (response.success) {
      console.log('✅ Restaurant fetched successfully!');
    }
    
    return response;
  } catch (error) {
    console.error('❌ Get restaurant error:', error);
    throw error;
  }
}

// Get meals by restaurant ID
export async function getMealsByRestaurant(restaurantId: string): Promise<ApiResponse<Meal[]>> {
  try {
    console.log('🍽️ Fetching meals for restaurant:', restaurantId);
    
    const response = await api.get<Meal[]>(`/restaurants/${restaurantId}/meals`);
    
    if (response.success) {
      console.log('✅ Restaurant meals fetched successfully!');
    }
    
    return response;
  } catch (error) {
    console.error('❌ Get restaurant meals error:', error);
    throw error;
  }
}

export default ApiService;

// 🥗 DIETARY PREFERENCES API METHODS
// Based on your backend API documentation

/**
 * Save user's dietary preferences to backend
 * POST /api/user/profile
 */
export async function saveDietaryPreferences(preferences: DietaryPreferences): Promise<ApiResponse<any>> {
  try {
    console.log('🥗 Saving dietary preferences:', preferences);
    
    // Validate required fields
    if (!preferences.healthGoal || !preferences.dietaryRestrictions || !preferences.preferredMealTags) {
      throw new Error('Missing required dietary preference fields');
    }
    
    console.log('📤 Sending to backend:', {
      endpoint: '/user/profile',
      method: 'POST',
      data: preferences
    });
    
    const response = await api.post('/user/profile', preferences);
    
    if (response.success) {
      console.log('✅ Dietary preferences saved successfully!');
      console.log('📋 Response:', response);
    } else {
      console.warn('⚠️ Backend returned unsuccessful response:', response);
    }
    
    return response;
  } catch (error: any) {
    console.error('❌ Save dietary preferences error:', error);
    
    // Return a proper error response
    return {
      success: false,
      message: error.message || 'Failed to save dietary preferences',
      error: error.message || 'Unknown error',
      status: 'error'
    };
  }
}

/**
 * Get personalized meals for user based on their preferences
 * GET /api/user/meals
 */
export async function getUserMeals(): Promise<ApiResponse<Meal[]>> {
  try {
    console.log('🍽️ Fetching personalized meals for user');
    
    const response = await api.get<Meal[]>('/user/meals');
    
    if (response.success && response.data) {
      console.log(`✅ User meals fetched successfully! Found ${response.data.length} meals`);
    } else {
      console.warn('⚠️ No meals found or unsuccessful response:', response);
    }
    
    return response;
  } catch (error: any) {
    console.error('❌ Get user meals error:', error);
    
    return {
      success: false,
      message: error.message || 'Failed to fetch personalized meals',
      error: error.message || 'Unknown error',
      status: 'error'
    };
  }
}

/**
 * Delete user profile (including dietary preferences)
 * DELETE /api/user/profile
 */
export async function deleteUserProfile(): Promise<ApiResponse<any>> {
  try {
    console.log('🗑️ Deleting user profile');
    
    const response = await api.delete('/user/profile');
    
    if (response.success) {
      console.log('✅ User profile deleted successfully!');
      
      // Clear local storage data related to profile
      await AsyncStorage.multiRemove([
        'hasUserProfile',
        'mealPlan',
        'dietaryPreferences'
      ]);
      console.log('🧹 Local profile data cleared');
    } else {
      console.warn('⚠️ Profile deletion unsuccessful:', response);
    }
    
    return response;
  } catch (error: any) {
    console.error('❌ Delete user profile error:', error);
    
    return {
      success: false,
      message: error.message || 'Failed to delete user profile',
      error: error.message || 'Unknown error',
      status: 'error'
    };
  }
}

/**
 * Get user's current profile/dietary preferences
 * GET /api/user/profile (if this endpoint exists)
 */
export async function getUserProfile(): Promise<ApiResponse<DietaryPreferences>> {
  try {
    console.log('👤 Fetching user profile');
    
    const response = await api.get<DietaryPreferences>('/user/profile');
    
    if (response.success && response.data) {
      console.log('✅ User profile fetched successfully!');
    } else {
      console.warn('⚠️ No profile found or unsuccessful response:', response);
    }
    
    return response;
  } catch (error: any) {
    console.error('❌ Get user profile error:', error);
    
    return {
      success: false,
      message: error.message || 'Failed to fetch user profile',
      error: error.message || 'Unknown error',
      status: 'error'
    };
  }
}

/**
 * Transform meal plan builder data to dietary preferences format
 * This converts frontend form data to backend API format
 */
export function transformMealPlanToDietaryPreferences(mealPlanData: MealPlanData): DietaryPreferences {
  // Map meal plan goals to health goals (exact format expected by backend)
  const healthGoalMapping: { [key: string]: string } = {
    'Balanced nutrition': 'balanced_nutrition',
    'Manage diabetes': 'manage_diabetes', 
    'Weight loss': 'weight_loss',
    'Plant-based': 'plant_based',
  };

  // Map restrictions to lowercase for backend consistency
  const dietaryRestrictions = mealPlanData.restrictions.map(restriction => 
    restriction.toLowerCase().replace(' ', '-')
  );

  // Generate preferred meal tags based on selections
  const preferredMealTags: string[] = [];
  
  // Add tags based on health goal
  if (mealPlanData.mealGoal === 'Weight loss') {
    preferredMealTags.push('low-calorie', 'high-protein');
  } else if (mealPlanData.mealGoal === 'Manage diabetes') {
    preferredMealTags.push('low-carb', 'sugar-free');
  } else if (mealPlanData.mealGoal === 'Plant-based') {
    preferredMealTags.push('vegan', 'plant-based');
  }
  
  // Add tags based on restrictions
  if (mealPlanData.restrictions.includes('Low-carb')) {
    preferredMealTags.push('low-carb');
  }
  if (mealPlanData.restrictions.includes('Vegetarian')) {
    preferredMealTags.push('vegetarian');
  }
  if (mealPlanData.restrictions.includes('Vegan')) {
    preferredMealTags.push('vegan');
  }

  return {
    healthGoal: healthGoalMapping[mealPlanData.mealGoal] || 'balanced_nutrition',
    dietaryRestrictions: dietaryRestrictions,
    preferredMealTags: [...new Set(preferredMealTags)] // Remove duplicates
  };
}

// ===== FAVORITES API =====

// Add meal to favorites
export async function addMealToFavorites(mealId: string): Promise<ApiResponse<any>> {
  try {
    console.log(`🌐 Adding meal ${mealId} to favorites...`);
    const response = await ApiService.post('/users/favorites', { 
      mealId: mealId 
    });
    
    if (response.success) {
      console.log('✅ Meal added to favorites successfully!');
    }
    
    return response;
  } catch (error) {
    console.error('❌ Error adding meal to favorites:', error);
    return {
      success: false,
      message: 'Failed to add meal to favorites',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Get user's favorite meals
export async function getFavoriteMeals(): Promise<ApiResponse<Meal[]>> {
  try {
    console.log('🌐 Fetching user favorite meals...');
    const response = await ApiService.get<Meal[]>('/users/favorites');
    
    if (response.success && response.data) {
      console.log('✅ Favorite meals fetched successfully!');
    }
    
    return response;
  } catch (error) {
    console.error('❌ Error fetching favorite meals:', error);
    return {
      success: false,
      message: 'Failed to fetch favorite meals',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Remove meal from favorites
export async function removeMealFromFavorites(mealId: string): Promise<ApiResponse<any>> {
  try {
    console.log(`🌐 Removing meal ${mealId} from favorites...`);
    const response = await ApiService.delete(`/users/favorites/${mealId}`);
    
    if (response.success) {
      console.log('✅ Meal removed from favorites successfully!');
    }
    
    return response;
  } catch (error) {
    console.error('❌ Error removing meal from favorites:', error);
    return {
      success: false,
      message: 'Failed to remove meal from favorites',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Retry configuration for cold starts
const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 2000, // 2 seconds
  retryOn503: true,
};

/**
 * Test all dietary preferences endpoints
 * This function tests the complete flow of dietary preference operations
 */
export async function testDietaryPreferencesFlow(): Promise<{
  saveTest: { success: boolean; message: string };
  getUserMealsTest: { success: boolean; message: string };
  getUserProfileTest: { success: boolean; message: string };
  overallStatus: string;
}> {
  console.log('🧪 Testing dietary preferences flow...');
  
  const results = {
    saveTest: { success: false, message: '' },
    getUserMealsTest: { success: false, message: '' },
    getUserProfileTest: { success: false, message: '' },
    overallStatus: ''
  };
  
  // Test data
  const testPreferences: DietaryPreferences = {
    healthGoal: 'weight_loss',
    dietaryRestrictions: ['vegetarian', 'gluten-free'],
    preferredMealTags: ['high-protein', 'low-carb']
  };
  
  try {
    // Test 1: Save dietary preferences
    console.log('🧪 Test 1: Save dietary preferences');
    const saveResponse = await saveDietaryPreferences(testPreferences);
    results.saveTest = {
      success: saveResponse.success,
      message: saveResponse.message || (saveResponse.success ? 'Save successful' : 'Save failed')
    };
    
    // Test 2: Get user profile
    console.log('🧪 Test 2: Get user profile');
    const profileResponse = await getUserProfile();
    results.getUserProfileTest = {
      success: profileResponse.success,
      message: profileResponse.message || (profileResponse.success ? 'Profile fetch successful' : 'Profile fetch failed')
    };
    
    // Test 3: Get personalized meals
    console.log('🧪 Test 3: Get personalized meals');
    const mealsResponse = await getUserMeals();
    results.getUserMealsTest = {
      success: mealsResponse.success,
      message: mealsResponse.message || (mealsResponse.success ? `Found ${mealsResponse.data?.length || 0} meals` : 'Meals fetch failed')
    };
    
    // Overall status
    const successCount = [results.saveTest.success, results.getUserProfileTest.success, results.getUserMealsTest.success].filter(Boolean).length;
    results.overallStatus = `${successCount}/3 tests passed`;
    
    console.log('🧪 Test results:', results);
    return results;
    
  } catch (error: any) {
    console.error('🧪 Test flow error:', error);
    results.overallStatus = 'Test flow failed';
    return results;
  }
}

