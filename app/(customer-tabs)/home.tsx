import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GreetingHeader from '../../components/Greeting';
import Category from '../../components/Categories';
import RestaurantCard from '../../components/RestaurantCards';
import MealCard from '../../components/MealCards';

import { useAuth } from '../../auth-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DietaryPreferences, Meal as BackendMeal, Restaurant as BackendRestaurant } from '../../services/api';
import { getHybridMeals, getHybridRestaurants } from '../../services/hybridMealService';
import MealFilterService from '../../services/mealFilterService';
import MealPlanService from '../../services/mealPlanService';
import { NotificationToast } from '../../components/NotificationToast';

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
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'cart'>('success');

  useEffect(() => {
    // Load both user profile and recommended meals on mount
    loadUserProfileAndMeals();
  }, []);

  // Add focus effect to reload profile and recommended meals when returning to home screen
  useFocusEffect(
    useCallback(() => {
      loadUserProfileAndMeals();
    }, [])
  );

  // Helper to fetch a few meals from a category
  const fetchCategoryMeals = async (allMeals: BackendMeal[], category: string, count: number) => {
    const filtered = await MealFilterService.filterMealsForCategory(allMeals, category, true);
    return filtered.slice(0, count);
  };

  const loadUserProfileAndMeals = async () => {
    try {
      // Load user profile info
      const firstName = await AsyncStorage.getItem('firstName');
      const savedName = firstName || 'Guest';
      const image = await AsyncStorage.getItem('profileImage');
      
      setUserName(savedName);
      if (image) setUserImage(image);

      // Load dietary preferences
      const dietaryData = await AsyncStorage.getItem('dietaryPreferences');
      let parsedPrefs = null;
      if (dietaryData) {
        parsedPrefs = JSON.parse(dietaryData);
        setDietaryPrefs(parsedPrefs);
        console.log('🍎 Loaded dietary preferences for personalization:', parsedPrefs);
      } else {
        setDietaryPrefs(null);
    }

      setIsLoading(true);
      const [mealsResponse, restaurantsResponse] = await Promise.all([
        getHybridMeals(),
        getHybridRestaurants()
      ]);
      // Meals: fetch a few from each category and combine
      if (mealsResponse.success && mealsResponse.data && mealsResponse.data.length > 0) {
        const breakfastMeals = await fetchCategoryMeals(mealsResponse.data, 'breakfast', 2);
        const lunchMeals = await fetchCategoryMeals(mealsResponse.data, 'lunch', 2);
        const dinnerMeals = await fetchCategoryMeals(mealsResponse.data, 'dinner', 2);
        const snacksMeals = await fetchCategoryMeals(mealsResponse.data, 'snacks', 2);
        const allMeals = [...breakfastMeals, ...lunchMeals, ...dinnerMeals, ...snacksMeals];
        // Remove duplicates by meal id
        const uniqueMealsMap = new Map();
        allMeals.forEach(meal => {
          if (!uniqueMealsMap.has(meal.id)) {
            uniqueMealsMap.set(meal.id, meal);
          }
        });
        const combinedMeals = Array.from(uniqueMealsMap.values()).slice(0, 6);
        // Map to Meal[]
        const convertedMeals = combinedMeals.map((meal, index) => ({
          id: meal.id,
          name: meal.name,
          description: meal.description,
          image: meal.image,
          price: meal.price,
          calories: typeof meal.calories === 'string' ? parseInt(meal.calories) || 0 : meal.calories,
          tags: meal.tags,
          restaurant: {
            id: meal.restaurant || 'unknown',
            name: meal.restaurant || 'Restaurant Name',
          },
        }));
        setRecommendedMeals(convertedMeals);
        setIsPersonalized(false); // No longer using custom personalized logic
      } else {
        setRecommendedMeals([]);
        setIsPersonalized(false);
      }
      // Restaurants (unchanged)
      if (restaurantsResponse.success && restaurantsResponse.data && restaurantsResponse.data.length > 0 && mealsResponse.success && mealsResponse.data) {
        let filteredRestaurants = restaurantsResponse.data;
        if (parsedPrefs) {
          filteredRestaurants = await MealFilterService.filterRestaurantsByMeals(restaurantsResponse.data, mealsResponse.data);
        }
        const convertedRestaurants = filteredRestaurants.slice(0, 5).map((restaurant, index) => convertHybridRestaurantToRestaurant(restaurant, index));
        setTopRestaurants(convertedRestaurants);
      } else {
        setTopRestaurants([]);
      }
    } catch (error) {
      console.error('Error loading user profile or meals:', error);
      setRecommendedMeals([]);
      setTopRestaurants([]);
      setIsPersonalized(false);
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

  const handleAddToPlan = async (meal: Meal) => {
    if (!isLoggedIn) {
      router.push('/(auth)/customer-login');
      return;
    }
    try {
      // Convert meal to match the service interface
      const mealForPlan = {
        id: meal.id,
        name: meal.name,
        description: meal.description,
        image: meal.image,
        tags: meal.tags,
        calories: meal.calories.toString(),
        price: meal.price,
        restaurant: meal.restaurant.name // Convert restaurant object to string
      };
      const result = await MealPlanService.addMealToPlan(mealForPlan);
      if (result.success) {
        setToastVisible(true);
        setToastMessage(result.message);
        setToastType('success');
      } else {
        setToastVisible(true);
        setToastMessage(result.message);
        setToastType('error');
      }
    } catch (error) {
      setToastVisible(true);
      setToastMessage('Failed to add meal to plan. Please try again.');
      setToastType('error');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f7f5f0" />
    <GreetingHeader name={userName} image={userImage} />
          
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
          {dietaryPrefs ? 'Recommended For You' : 'Popular Meals'}
        </Text>
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
            {dietaryPrefs ? 'Restaurants For You' : 'Top Restaurants'}
          </Text>
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
              💡Drinking water 30 minutes before meals can help with digestion and portion control.
            </Text>
          </View>
        </View>
    </ScrollView>
    <NotificationToast
      visible={toastVisible}
      message={toastMessage}
      type={toastType}
      onHide={() => setToastVisible(false)}
    />
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
