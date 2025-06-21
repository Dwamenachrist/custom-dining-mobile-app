import { View, ScrollView, Text, StyleSheet, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GreetingHeader from '../../components/Greeting';
import Category from '../../components/Categories';
import RestaurantCard from '../../components/RestaurantCards';
import MealCard from '../../components/MealCards';
import { EmailVerificationBanner } from '../../components/EmailVerificationBanner';

import { useAuth } from '../../auth-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUserMeals, DietaryPreferences, Meal as BackendMeal, Restaurant as BackendRestaurant } from '../../services/api';
import { getHybridMeals, getHybridRestaurants } from '../../services/hybridMealService';
import AuthService from '../../services/authService';

// Types for frontend components
interface Meal {
  id: string;
  name: string;
  description: string;
  image: any;
  price: number;
  calories: number;
  tags: string[];
  restaurant: {
    id: string;
    name: string;
  };
}

interface Restaurant {
  id: string;
  name: string;
  image: any;
  rating: number;
  reviewCount: number;
  tags: string[];
  distance: string;
  deliveryTime: string;
}

// Function to convert backend Meal to frontend Meal interface
const convertBackendMealToMeal = (backendMeal: BackendMeal, index: number): Meal => {
  return {
    id: backendMeal.id, // Backend uses string IDs
    name: backendMeal.name,
    description: backendMeal.description,
    // Use hybrid meal image if available, otherwise placeholder
    image: backendMeal.image || { uri: 'https://via.placeholder.com/150x100/758F76/FFFFFF?text=No+Image' },
    price: parseFloat(backendMeal.price) || 3000, // Convert string price to number
    calories: backendMeal.nutritionalInfo?.calories || 400,
    tags: backendMeal.dietaryTags.map(tag => tag.charAt(0).toUpperCase() + tag.slice(1).replace('-', ' ')),
    restaurant: {
      id: backendMeal.restaurantId || 'unknown',
      name: backendMeal.restaurant?.name || 'Restaurant Name'
    }
  };
};

// Function to convert hybrid restaurant to frontend Restaurant interface
const convertHybridRestaurantToRestaurant = (hybridRestaurant: any, index: number): Restaurant => {
  return {
    id: hybridRestaurant.restaurantId,
    name: hybridRestaurant.restaurantName,
    image: hybridRestaurant.image,
    rating: hybridRestaurant.rating || 4.5,
    reviewCount: hybridRestaurant.reviewCount || 100,
    tags: [hybridRestaurant.cuisineType || 'Restaurant'],
    distance: '2.0 km', // Default since backend doesn't provide
    deliveryTime: hybridRestaurant.deliveryTime || '25 - 35 min'
  };
};

export default function HomeScreen() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [recommendedMeals, setRecommendedMeals] = useState<Meal[]>([]);
  const [topRestaurants, setTopRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('Guest');
  const [userImage, setUserImage] = useState<string | null>(null);
  const [dietaryPrefs, setDietaryPrefs] = useState<DietaryPreferences | null>(null);
  const [isPersonalized, setIsPersonalized] = useState(false);


  useEffect(() => {
    loadData();
    loadUserProfile();
  }, []);

  // Add focus effect to reload profile when returning to home screen
  useFocusEffect(
    useCallback(() => {
      loadUserProfile();
    }, [])
  );

  const loadUserProfile = async () => {
    try {
      // Check multiple possible keys for the user name
      const profileName = await AsyncStorage.getItem('profileName');
      const firstName = await AsyncStorage.getItem('firstName');
      const userName = await AsyncStorage.getItem('userName');
      const savedName = profileName || firstName || userName || 'Guest';
      
      // Use the correct key for profile image
      const image = await AsyncStorage.getItem('profileImage');
      
      setUserName(savedName);
      if (image) setUserImage(image);

      // Load dietary preferences from meal plan builder
      const dietaryData = await AsyncStorage.getItem('dietaryPreferences');
      if (dietaryData) {
        const parsed = JSON.parse(dietaryData);
        setDietaryPrefs(parsed);
        console.log('🍎 Loaded dietary preferences for personalization:', parsed);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  // Filter meals based on dietary preferences
  const filterMealsByPreferences = (meals: BackendMeal[]): BackendMeal[] => {
    if (!dietaryPrefs || (!dietaryPrefs.dietaryRestrictions.length && !dietaryPrefs.preferredMealTags.length)) {
      return meals;
    }

    const filtered = meals.filter(meal => {
      // Check if meal matches dietary restrictions
      const matchesRestrictions = dietaryPrefs.dietaryRestrictions.length === 0 || 
        dietaryPrefs.dietaryRestrictions.some(restriction => 
          meal.dietaryTags.some(tag => 
            tag.toLowerCase().includes(restriction.toLowerCase()) ||
            restriction.toLowerCase().includes(tag.toLowerCase())
          )
        );

      // Check if meal matches preferred tags
      const matchesPreferredTags = dietaryPrefs.preferredMealTags.length === 0 ||
        dietaryPrefs.preferredMealTags.some(preferred => 
          meal.dietaryTags.some(tag => 
            tag.toLowerCase().includes(preferred.toLowerCase()) ||
            preferred.toLowerCase().includes(tag.toLowerCase())
          )
        );

      return matchesRestrictions || matchesPreferredTags;
    });

    console.log(`🎯 Filtered ${meals.length} meals to ${filtered.length} based on preferences`);
    setIsPersonalized(filtered.length !== meals.length && filtered.length > 0);
    
    return filtered.length > 0 ? filtered : meals;
  };

  // Load meals from hybrid service (backend + comprehensive local)
  const loadPersonalizedMeals = async (): Promise<Meal[]> => {
    try {
      // First try personalized meals if user has auth token
      const authToken = await AsyncStorage.getItem('auth_token');
      if (authToken && dietaryPrefs) {
        console.log('🌐 Attempting to load personalized meals from backend...');
        const response = await getUserMeals();
        
        if (response.success && response.data && response.data.length > 0) {
          console.log('✅ Loaded personalized meals from backend!');
          return response.data.slice(0, 6).map((meal, index) => convertBackendMealToMeal(meal, index));
        }
      }

      // Fall back to hybrid meals (backend + comprehensive local)
      console.log('🎯 Loading hybrid meals (backend + local)...');
      const response = await getHybridMeals();
      
      console.log('🔍 DEBUG: Full hybrid meals response:', JSON.stringify(response, null, 2));
      
      if (response.success && response.data && response.data.length > 0) {
        console.log('✅ Loaded hybrid meals successfully!');
        console.log('🔍 DEBUG: First hybrid meal:', JSON.stringify(response.data[0], null, 2));
        
        // Filter meals based on dietary preferences
        const filteredMeals = filterMealsByPreferences(response.data);
        const convertedMeals = filteredMeals.slice(0, 6).map((meal, index) => convertBackendMealToMeal(meal, index));
        
        console.log('🔍 DEBUG: First converted hybrid meal:', JSON.stringify(convertedMeals[0], null, 2));
        
        return convertedMeals;
      }

      // If no hybrid data, return empty array
      console.log('⚠️ No meals available from hybrid service');
      return [];
    } catch (error) {
      console.error('❌ Error loading meals from hybrid service:', error);
      return [];
    }
  };

  // Load restaurants from hybrid service
  const loadTopRestaurants = async (): Promise<Restaurant[]> => {
    try {
      console.log('🏪 Loading restaurants from hybrid service...');
      const response = await getHybridRestaurants();
      
      if (response.success && response.data && response.data.length > 0) {
        console.log('✅ Loaded restaurants from hybrid service!');
        return response.data.slice(0, 5).map((restaurant, index) => convertHybridRestaurantToRestaurant(restaurant, index));
      }

      console.log('⚠️ No restaurants available from hybrid service');
      return [];
    } catch (error) {
      console.error('❌ Error loading restaurants from hybrid service:', error);
      return [];
    }
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      const [meals, restaurants] = await Promise.all([
        loadPersonalizedMeals(),
        loadTopRestaurants()
      ]);
      
      setRecommendedMeals(meals);
      setTopRestaurants(restaurants);
      
      console.log(`📊 Loaded ${meals.length} meals and ${restaurants.length} restaurants`);
    } catch (error) {
      console.error('❌ Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMealPress = (meal: Meal) => {
    router.push({
      pathname: '/meal/[id]',
      params: { 
        id: meal.id,
        name: meal.name,
        description: meal.description,
        price: meal.price.toString(),
        calories: meal.calories.toString(),
        imageSource: JSON.stringify(meal.image),
        tags: JSON.stringify(meal.tags),
        restaurantId: meal.restaurant.id,
        restaurantName: meal.restaurant.name
      }
    });
  };

  const handleRestaurantPress = (restaurant: Restaurant) => {
    router.push({
      pathname: '/restaurant-profile',
      params: {
        id: restaurant.id,
        name: restaurant.name,
        rating: restaurant.rating.toString(),
        reviewCount: restaurant.reviewCount.toString(),
        imageSource: JSON.stringify(restaurant.image),
        tags: JSON.stringify(restaurant.tags),
        distance: restaurant.distance,
        deliveryTime: restaurant.deliveryTime
      }
    });
  };

  const handleAddToPlan = (meal: Meal) => {
    if (!isLoggedIn) {
      router.push('/(auth)/customer-login');
      return;
    }
    // TODO: Implement add to meal plan functionality
    console.log('Adding to plan:', meal.name);
  };

  const handleResendEmail = async () => {
    try {
      console.log('📧 Resending verification email...');
      
      // Show loading feedback
      Alert.alert('📧 Sending...', 'Resending verification email...');
      
      // Call AuthService to resend verification email
      const response = await AuthService.resendVerificationEmail();
      
      if (response.success) {
        Alert.alert(
          '✅ Email Sent!', 
          'We\'ve sent a new verification link to your email. Please check your inbox.'
        );
      } else {
        Alert.alert(
          '❌ Failed to Send', 
          response.message || 'Failed to resend verification email. Please try again.'
        );
      }
    } catch (error) {
      console.error('❌ Resend email error:', error);
      Alert.alert(
        '❌ Error', 
        'An unexpected error occurred. Please try again later.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f7f5f0" />
    <GreetingHeader name={userName} image={userImage} />
      
      {/* Email Verification Banner */}
      <EmailVerificationBanner onResendEmail={handleResendEmail} />
      
      {/* Categories - Outside ScrollView */}
      <View style={styles.categoryWrapper}>
      <Category />
      </View>
      
      {/* Main Content ScrollView */}
      <ScrollView 
        contentContainerStyle={styles.container} 
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
      <View style={styles.sectionHeader}>
        <View style={{ flex: 1 }}>
        <Text style={styles.sectionTitle}>
          {dietaryPrefs ? '🎯 Recommended For You' : '🍽️ Popular Meals'}
        </Text>
          {isPersonalized && dietaryPrefs && (
            <Text style={{ fontSize: 12, color: '#10b981', fontWeight: '500', marginTop: 2 }}>
              🎯 Personalized for {dietaryPrefs.healthGoal.replace('_', ' ')} • {dietaryPrefs.dietaryRestrictions.join(', ')}
            </Text>
          )}
          {!dietaryPrefs && (
            <TouchableOpacity onPress={() => router.push('/meal-plan-builder')} style={{ marginTop: 2 }}>
              <Text style={{ fontSize: 12, color: '#f59e0b', fontWeight: '500' }}>
                ⚡ Complete profile for personalized recommendations
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={() => router.push('/meal/recommended')}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>
      <MealCard 
        meals={recommendedMeals}
        onMealPress={handleMealPress}
        onAddToPlan={handleAddToPlan}
        isLoading={isLoading}
      />

      <View style={styles.sectionHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>
            {dietaryPrefs ? '🏆 Restaurants For You' : '🏆 Top Restaurants'}
          </Text>
          {!dietaryPrefs && (
            <Text style={{ fontSize: 12, color: '#6b7280', fontStyle: 'italic', marginTop: 2 }}>
              Popular choices • Complete profile for personalized options
            </Text>
          )}
        </View>
        <TouchableOpacity onPress={() => router.push('/restaurants')}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>
      <RestaurantCard 
        restaurants={topRestaurants}
        onRestaurantPress={handleRestaurantPress}
        isLoading={isLoading}
      />
        
        {/* Tip Of The Day Section */}
        <View style={styles.tipSection}>
          <Text style={styles.sectionTitle}>Tip Of The Day</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipText}>
              💡 Drinking water 30 minutes before meals can help with digestion and portion control.
            </Text>
          </View>
        </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f5f0',
  },
  categoryWrapper: {
    paddingHorizontal: 16,
  },
  scrollView: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 30, // Reduced from 100 to 30
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
    marginHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  seeAll: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
  tipSection: {
    marginTop: 20,
    marginBottom: 8,
  },
  tipCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 20,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  tipText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
    fontWeight: '500',
  },
});
