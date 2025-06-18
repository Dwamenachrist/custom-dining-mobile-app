import { View, ScrollView, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GreetingHeader from '../../components/Greeting';
import Category from '../../components/Categories';
import RestaurantCard from '../../components/RestaurantCards';
import MealCard from '../../components/MealCards';
import { useAuth } from '../../auth-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { mockApi, MockMeal } from '../../services/mockData';

// Types
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

const TOP_RESTAURANTS: Restaurant[] = [
  {
    id: '1',
    name: 'Green Chef Kitchen',
    image: require('../../assets/restaurant1.png'),
    rating: 4.8,
    reviewCount: 245,
    tags: ['Vegan', 'Healthy', 'Organic'],
    distance: '1.2 km',
    deliveryTime: '20 - 30 min'
  },
  {
    id: '2',
    name: 'African Delights',
    image: require('../../assets/restaurant2.png'),
    rating: 4.6,
    reviewCount: 189,
    tags: ['African', 'Traditional', 'Spicy'],
    distance: '2.5 km',
    deliveryTime: '25 - 35 min'
  },
  {
    id: '3',
    name: 'Healthy Bites',
    image: require('../../assets/restaurant3.png'),
    rating: 4.9,
    reviewCount: 312,
    tags: ['Healthy', 'Organic', 'Fresh'],
    distance: '1.8 km',
    deliveryTime: '15 - 25 min'
  }
];

// Function to convert MockMeal to Meal interface
const convertMockMealToMeal = (mockMeal: MockMeal, index: number): Meal => {
  // Array of meal images to rotate through
  const mealImages = [
    require('../../assets/recommendation1.png'),
    require('../../assets/recommendation2.png'),
    require('../../assets/recommendation3.png'),
  ];
  
  // Array of restaurant names to rotate through
  const restaurantNames = [
    'Green Chef Kitchen',
    'Fresh Garden Bistro',
    'Healthy Harvest',
    'Organic Oasis',
    'Farm to Table',
    'Pure Plate'
  ];

  return {
    id: mockMeal.id.toString(),
    name: mockMeal.name,
    description: mockMeal.description,
    image: mealImages[index % mealImages.length],
    price: Math.floor(mockMeal.nutritionalInfo.calories / 25), // Convert calories to reasonable price
    calories: mockMeal.nutritionalInfo.calories,
    tags: mockMeal.dietaryTags.map(tag => tag.charAt(0).toUpperCase() + tag.slice(1).replace('-', ' ')),
    restaurant: {
      id: mockMeal.restaurantId || (index + 1).toString(),
      name: restaurantNames[index % restaurantNames.length]
    }
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
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load meals from mock API
      const mockMeals = await mockApi.getMeals();
      const convertedMeals = mockMeals.slice(0, 6).map((mockMeal, index) => convertMockMealToMeal(mockMeal, index));
      setRecommendedMeals(convertedMeals);
      
      // Load restaurants
      setTopRestaurants(TOP_RESTAURANTS);
    } catch (error) {
      console.error('Error loading data:', error);
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
        image: meal.image,
        tags: JSON.stringify(meal.tags),
        restaurantId: meal.restaurant.id,
        restaurantName: meal.restaurant.name
      }
    });
  };

  const handleRestaurantPress = (restaurant: Restaurant) => {
    router.push({
      pathname: '/restaurants',
      params: {
        id: restaurant.id,
        name: restaurant.name,
        rating: restaurant.rating.toString(),
        reviewCount: restaurant.reviewCount.toString(),
        image: restaurant.image,
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
        <Text style={styles.sectionTitle}>Recommended For You</Text>
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
        <Text style={styles.sectionTitle}>Top Restaurants</Text>
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
