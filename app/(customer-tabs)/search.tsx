import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, TextInput as RNTextInput, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { useAuth } from '../../auth-context';
import { Button } from '../../components/Button';
import { getHybridMeals, getHybridRestaurants } from '../../services/hybridMealService';
import MealFilterService from '../../services/mealFilterService';
import MealPlanService from '../../services/mealPlanService';
import { ComingSoonToast } from '../../components/ComingSoonToast';
import { NotificationToast } from '../../components/NotificationToast';

interface BackendMeal {
  id: string;
  name: string;
  description: string;
  price: string;
  image?: string;
  dietaryTags: string[];
  restaurant?: { name: string };
}

interface Restaurant {
  id: string;
  name: string;
  image: any;
  tags: string[];
  rating: number;
  reviewCount: number;
  distance?: string;
  type: 'restaurant';
}

interface Meal {
  id: string;
  name: string;
  description: string;
  price: number;
  image: any;
  tags: string[];
  restaurant?: string;
  type: 'meal';
}

const convertHybridRestaurant = (restaurant: any): Restaurant => {
  console.log('🔍 Converting restaurant:', JSON.stringify(restaurant, null, 2));
  
  // Generate tags based on cuisine type and other properties
  const generateTags = (cuisineType: string, priceRange: string): string[] => {
    console.log('🏷️ Generating tags for cuisineType:', cuisineType, 'priceRange:', priceRange);
    const tags: string[] = [];
    
    // Add cuisine-based tags
    if (cuisineType.toLowerCase().includes('healthy')) tags.push('Healthy');
    if (cuisineType.toLowerCase().includes('fresh')) tags.push('Fresh');
    if (cuisineType.toLowerCase().includes('organic')) tags.push('Organic');
    if (cuisineType.toLowerCase().includes('traditional')) tags.push('Traditional');
    if (cuisineType.toLowerCase().includes('nigerian')) tags.push('Nigerian');
    if (cuisineType.toLowerCase().includes('grill')) tags.push('Grill');
    if (cuisineType.toLowerCase().includes('salad')) tags.push('Salad');
    if (cuisineType.toLowerCase().includes('nutrition')) tags.push('Nutritious');
    if (cuisineType.toLowerCase().includes('wellness')) tags.push('Wellness');
    if (cuisineType.toLowerCase().includes('contemporary')) tags.push('Contemporary');
    if (cuisineType.toLowerCase().includes('health-focused')) tags.push('Health-Focused');
    
    // Add price-based tags
    if (priceRange === '₦₦') tags.push('Budget-Friendly');
    if (priceRange === '₦₦₦') tags.push('Mid-Range');
    if (priceRange === '₦₦₦₦') tags.push('Premium');
    
    // Add default tag if no specific tags
    if (tags.length === 0) tags.push('Restaurant');
    
    console.log('✅ Generated tags:', tags);
    return tags;
  };

  const cuisineType = restaurant.cuisineType || '';
  const priceRange = restaurant.priceRange || '';
  
  console.log('🏪 Restaurant fields - cuisineType:', cuisineType, 'priceRange:', priceRange);

  const result: Restaurant = {
    id: restaurant.restaurantId || restaurant.id,
    name: restaurant.restaurantName || restaurant.name,
  image: restaurant.image || require('../../assets/restaurant1.png'),
    tags: generateTags(cuisineType, priceRange),
  rating: restaurant.rating || 4.5,
  reviewCount: restaurant.reviewCount || 100,
  distance: restaurant.distance || '2.0 km',
  type: 'restaurant'
  };
  
  console.log('🏪 Converted restaurant result:', JSON.stringify(result, null, 2));
  return result;
};

const convertHybridMeal = (meal: BackendMeal): Meal => ({
  id: meal.id,
  name: meal.name,
  description: meal.description,
  price: parseFloat(meal.price) || 0,
  image: meal.image || require('../../assets/recommendation1.png'),
  tags: meal.dietaryTags && meal.dietaryTags.length > 0 ? meal.dietaryTags.slice(0, 2) : ['Meal'],
  restaurant: meal.restaurant?.name || 'Restaurant',
  type: 'meal'
});

const DEFAULT_FILTERS = ['Vegan', 'Gluten-Free', 'Low-Carb', 'High-Protein', 'Dairy-Free', 'Keto', 'Organic', 'Fresh'];

// Fallback meals data for search
const FALLBACK_MEALS: Meal[] = [
  // Breakfast meals
  {
    id: 'breakfast-1',
    name: 'Fruity Oats Delight',
    description: 'A delightful bowl of oats topped with mixed fruits',
    image: require('../../assets/meals/Fruity Oats delight.png'),
    tags: ['Low-Carb', 'Sugar-Free', 'Breakfast'],
    price: 5000,
    restaurant: 'Green Chef Kitchen',
    type: 'meal'
  },
  {
    id: 'breakfast-2',
    name: 'Avocado Toast And Egg',
    description: 'A nutritious dish of toasted bread with avocado spread and egg',
    image: require('../../assets/meals/Avocado Toast and Egg.png'),
    tags: ['High-Protein', 'Healthy-Fats', 'Breakfast'],
    price: 4500,
    restaurant: 'Health n Healthy',
    type: 'meal'
  },
  {
    id: 'breakfast-3',
    name: 'Fruity Pancakes',
    description: 'Fluffy Strawberry banana pancakes',
    image: require('../../assets/meals/Fruity pancakes.png'),
    tags: ['Breakfast', 'High-Protein'],
    price: 5500,
    restaurant: 'NOK By Alara',
    type: 'meal'
  },
  {
    id: 'breakfast-4',
    name: 'Peanut Butter Toast',
    description: 'Peanut butter spread on toasted whole wheat bread and banana',
    image: require('../../assets/meals/Peanut Butter Toast.png'),
    tags: ['High-Protein', 'Energy-Boosting', 'Breakfast'],
    price: 3000,
    restaurant: 'Addys Health Kitchen',
    type: 'meal'
  },
  // Lunch meals
  {
    id: 'lunch-1',
    name: 'Basmati Jollof Rice',
    description: 'Aromatic basmati rice cooked with tomatoes and spices',
    image: require('../../assets/meals/Basmati Jollof Rice.png'),
    tags: ['Traditional', 'High-Carb', 'Lunch'],
    price: 4000,
    restaurant: 'Green Chef Kitchen',
    type: 'meal'
  },
  {
    id: 'lunch-2',
    name: 'Grilled Fish and Veggies',
    description: 'Fresh grilled fish with steamed vegetables',
    image: require('../../assets/meals/Grilled Fish and Veggies.png'),
    tags: ['High-Protein', 'Low-Carb', 'Lunch'],
    price: 7500,
    restaurant: 'Health n Healthy',
    type: 'meal'
  },
  {
    id: 'lunch-3',
    name: 'Ofada Rice and Sauce',
    description: 'Traditional ofada rice with spicy sauce',
    image: require('../../assets/meals/Ofada Rice and Sauce.png'),
    tags: ['Traditional', 'Spicy', 'Lunch'],
    price: 5500,
    restaurant: 'NOK By Alara',
    type: 'meal'
  },
  {
    id: 'lunch-4',
    name: 'Tofu Rice',
    description: 'Healthy tofu rice with vegetables',
    image: require('../../assets/meals/Tofu Rice.png'),
    tags: ['Vegan', 'High-Protein', 'Lunch'],
    price: 4800,
    restaurant: 'Addys Health Kitchen',
    type: 'meal'
  },
  // Dinner meals
  {
    id: 'dinner-1',
    name: 'Plantain and Egg Sauce',
    description: 'Ripe plantain with rich egg sauce',
    image: require('../../assets/meals/Plantain and Egg sauce.png'),
    tags: ['Traditional', 'High-Carb', 'Dinner'],
    price: 3800,
    restaurant: 'Green Chef Kitchen',
    type: 'meal'
  },
  {
    id: 'dinner-2',
    name: 'Beans and Potato',
    description: 'Nourishing beans with boiled potatoes',
    image: require('../../assets/meals/Beans and Potato.png'),
    tags: ['High-Protein', 'Traditional', 'Dinner'],
    price: 2800,
    restaurant: 'Health n Healthy',
    type: 'meal'
  },
  {
    id: 'dinner-3',
    name: 'Sauce and Yam',
    description: 'Boiled yam with rich tomato sauce',
    image: require('../../assets/meals/Sauce and Yam.png'),
    tags: ['Traditional', 'High-Carb', 'Dinner'],
    price: 3200,
    restaurant: 'NOK By Alara',
    type: 'meal'
  },
  {
    id: 'dinner-4',
    name: 'Plantain and Soup',
    description: 'Ripe plantain with vegetable soup',
    image: require('../../assets/meals/Plantain and Soup.png'),
    tags: ['Traditional', 'Vegan', 'Dinner'],
    price: 3500,
    restaurant: 'Addys Health Kitchen',
    type: 'meal'
  },
  // Snack meals
  {
    id: 'snack-1',
    name: 'Fruit Salad',
    description: 'Fresh mixed fruits with honey drizzle',
    image: require('../../assets/meals/Fruity Oats delight.png'),
    tags: ['Vegan', 'Low-Calorie', 'Snack'],
    price: 1500,
    restaurant: 'Green Chef Kitchen',
    type: 'meal'
  },
  {
    id: 'snack-2',
    name: 'Nuts Mix',
    description: 'Assorted nuts and dried fruits',
    image: require('../../assets/meals/Peanut Butter Toast.png'),
    tags: ['High-Protein', 'Energy-Boosting', 'Snack'],
    price: 2000,
    restaurant: 'Health n Healthy',
    type: 'meal'
  },
  {
    id: 'snack-3',
    name: 'Smoothie Bowl',
    description: 'Acai smoothie bowl with granola',
    image: require('../../assets/meals/Avocado Veggie Bowl.png'),
    tags: ['Vegan', 'Superfood', 'Snack'],
    price: 2800,
    restaurant: 'NOK By Alara',
    type: 'meal'
  },
  {
    id: 'snack-4',
    name: 'Yogurt Parfait',
    description: 'Greek yogurt with berries and honey',
    image: require('../../assets/meals/Fruity Oats delight.png'),
    tags: ['High-Protein', 'Probiotic', 'Snack'],
    price: 1800,
    restaurant: 'Addys Health Kitchen',
    type: 'meal'
  }
];

// Use only default filters - no smart filtering

export default function SearchScreen() {
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'meals' | 'restaurants'>('meals');
  const [meals, setMeals] = useState<Meal[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredMeals, setFilteredMeals] = useState<Meal[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'cart'>('success');
  const [comingSoonVisible, setComingSoonVisible] = useState(false);
  const [personalizationInfo, setPersonalizationInfo] = useState<{
    isPersonalized: boolean;
    summary: string;
  }>({ isPersonalized: false, summary: '' });
  const [smartFilters, setSmartFilters] = useState<string[]>(DEFAULT_FILTERS);

  useEffect(() => {
    loadData();
    loadPersonalizationInfo();
  }, []);

  const loadPersonalizationInfo = async () => {
    const info = await MealFilterService.getPersonalizationInfo();
    setPersonalizationInfo({
      isPersonalized: info.isPersonalized,
      summary: info.summary
    });
  };

  useEffect(() => {
    console.log('🔄 useEffect triggered - searchQuery:', searchQuery, 'activeFilters:', activeFilters, 'meals count:', meals.length, 'restaurants count:', restaurants.length);
    handleSearch();
  }, [searchQuery, activeFilters, meals, restaurants]);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading search data...');
      
      // Load both meals and restaurants in parallel
      const [mealsResponse, restaurantsResponse] = await Promise.all([
        getHybridMeals(),
        getHybridRestaurants()
      ]);
      
      // Process meals with dietary filtering
      if (mealsResponse.success && mealsResponse.data && mealsResponse.data.length > 0) {
        const preferences = await MealFilterService.loadDietaryPreferences();
        let processedMeals = mealsResponse.data;
        
        // Apply dietary preferences if available
        if (preferences) {
          processedMeals = mealsResponse.data.filter(meal => 
            MealFilterService.matchesDietaryPreferences(meal, preferences)
          );
          console.log(`🎯 Filtered ${mealsResponse.data.length} meals to ${processedMeals.length} based on dietary preferences`);
        }
        
        const convertedMeals = processedMeals.map(convertHybridMeal);
        setMeals(convertedMeals);
        setFilteredMeals(convertedMeals); // Initialize filtered meals
        console.log(`✅ Loaded ${convertedMeals.length} meals for search`);
      } else {
        // Use fallback meals if no backend data or empty response
        console.log('📦 Using fallback meals for search');
        setMeals(FALLBACK_MEALS);
        setFilteredMeals(FALLBACK_MEALS); // Initialize filtered meals with fallback
      }
      
      // Process restaurants with dietary filtering
      if (restaurantsResponse.success && restaurantsResponse.data) {
        console.log('🏪 Raw restaurant data from service:', restaurantsResponse.data);
        let processedRestaurants = restaurantsResponse.data;
        
        // Temporarily disable dietary filtering to debug tag issue
        // if (mealsResponse.success && mealsResponse.data) {
        //   processedRestaurants = await MealFilterService.filterRestaurantsByMeals(
        //     restaurantsResponse.data,
        //     mealsResponse.data
        //   );
        //   console.log(`🏪 Filtered restaurants based on meal preferences`);
        // }
        
        const convertedRestaurants = processedRestaurants.map(convertHybridRestaurant);
        console.log('🏪 Final converted restaurants:', convertedRestaurants);
        setRestaurants(convertedRestaurants);
        setFilteredRestaurants(convertedRestaurants); // Initialize filtered restaurants
        console.log(`✅ Loaded ${convertedRestaurants.length} restaurants for search`);
      } else {
        // No fallback restaurants - just set empty arrays
        console.log('🏪 No restaurant data available');
        setRestaurants([]);
        setFilteredRestaurants([]);
      }
      
    } catch (error) {
      console.error('❌ Error loading search data:', error);
      // Use fallback data on error
      console.log('📦 Using fallback data due to error');
      setMeals(FALLBACK_MEALS);
      setFilteredMeals(FALLBACK_MEALS); // Initialize filtered meals with fallback
      setRestaurants([]);
      setFilteredRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (items: (Meal | Restaurant)[]): (Meal | Restaurant)[] => {
    if (activeFilters.length === 0) return items;
    
    console.log('🔍 Applying filters:', activeFilters);
    console.log('📦 Items to filter:', items.length);
    
    const filtered = items.filter(item => {
      if (item.type === 'meal') {
        // OR logic: show if any tag matches
        const matches = activeFilters.some(filter =>
          item.tags.some(tag => tag.toLowerCase().includes(filter.toLowerCase()))
        );
        console.log(`🍽️ Meal "${item.name}" with tags [${item.tags.join(', ')}] matches filters: ${matches}`);
        return matches;
      }
      if (item.type === 'restaurant') {
        // Show if any tag matches
        const tagMatch = activeFilters.some(filter =>
        item.tags.some(tag => tag.toLowerCase().includes(filter.toLowerCase()))
        );
        // Show if the restaurant has at least one meal that matches the filters
        const hasMatchingMeal = meals.some(meal =>
          meal.restaurant === item.name &&
          activeFilters.some(filter =>
            meal.tags.some(tag => tag.toLowerCase().includes(filter.toLowerCase()))
          )
        );
        const matches = tagMatch || hasMatchingMeal;
        console.log(`🏪 Restaurant "${item.name}" with tags [${item.tags.join(', ')}] matches filters: ${matches}`);
        return matches;
      }
      return false;
    });
    
    console.log(`✅ Filtered ${items.length} items to ${filtered.length} items`);
    return filtered;
  };

  // Enhanced smart search that considers dietary preferences and provides better matching
  const performSmartSearch = async (query: string, items: (Meal | Restaurant)[]): Promise<(Meal | Restaurant)[]> => {
    const preferences = await MealFilterService.loadDietaryPreferences();
    const queryLower = query.toLowerCase().trim();
    
    if (!queryLower) return items;

    // Split query into words for better matching
    const queryWords = queryLower.split(/\s+/);
    
    // Enhanced text search with scoring
    const scoredItems = items.map(item => {
      let score = 0;
      const itemNameLower = item.name.toLowerCase();
      const itemTagsLower = item.tags.map(tag => tag.toLowerCase());
      
      // Exact name match gets highest score
      if (itemNameLower === queryLower) {
        score += 100;
      }
      // Name starts with query
      else if (itemNameLower.startsWith(queryLower)) {
        score += 80;
      }
      // Name contains query
      else if (itemNameLower.includes(queryLower)) {
        score += 60;
      }
      
      // Check each word in the query
      queryWords.forEach(word => {
        if (itemNameLower.includes(word)) {
          score += 40;
        }
        if (itemTagsLower.some(tag => tag.includes(word))) {
          score += 30;
        }
        if (item.type === 'meal' && (item as Meal).description.toLowerCase().includes(word)) {
          score += 20;
        }
      });
      
      // Tag matches
      itemTagsLower.forEach(tag => {
        if (queryWords.some(word => tag.includes(word) || word.includes(tag))) {
          score += 25;
        }
      });

      // Restaurant-specific scoring
      if (item.type === 'restaurant') {
        const restaurant = item as Restaurant;
        // Boost restaurants with higher ratings
        score += restaurant.rating * 2;
        // Boost restaurants with more reviews
        score += Math.min(restaurant.reviewCount / 10, 10);
      }

      return { item, score };
    });

    // Filter items with scores and sort by score
    const matchedItems = scoredItems
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ item }) => item);

    // If user has dietary preferences, boost relevant results
    if (preferences && preferences.preferredMealTags.length > 0) {
      const preferredTerms = preferences.preferredMealTags.map(tag => tag.toLowerCase());
      const dietaryMatches = items.filter(item =>
        item.tags.some(tag => 
          preferredTerms.some(preferred => 
            tag.toLowerCase().includes(preferred) || preferred.includes(tag.toLowerCase())
          )
        )
      );

      // Combine and deduplicate, prioritizing text matches
      const combined = [...matchedItems];
      dietaryMatches.forEach(match => {
        if (!combined.find(item => item.id === match.id)) {
          combined.push(match);
        }
      });

      return combined;
    }

    return matchedItems;
  };

  const handleSearch = async () => {
    console.log('🔍 handleSearch called - searchQuery:', searchQuery, 'meals count:', meals.length, 'restaurants count:', restaurants.length);
    
    if (searchQuery.trim() === '') {
      setShowResults(false);
      // Show all meals and restaurants when no search query
      const filteredMealsResult = applyFilters(meals) as Meal[];
      const filteredRestaurantsResult = applyFilters(restaurants) as Restaurant[];
      setFilteredMeals(filteredMealsResult);
      setFilteredRestaurants(filteredRestaurantsResult);
      console.log('📦 No search query - showing all items. Meals:', filteredMealsResult.length, 'Restaurants:', filteredRestaurantsResult.length);
      return;
    }

    setLoading(true);
    setShowResults(true);

    try {
      const query = searchQuery.toLowerCase();
      
      // Use enhanced smart search that considers dietary preferences
      const searchedMeals = await performSmartSearch(query, meals) as Meal[];
      const searchedRestaurants = await performSmartSearch(query, restaurants) as Restaurant[];
      
      // Apply additional filters
      const finalFilteredMeals = applyFilters(searchedMeals) as Meal[];
      const finalFilteredRestaurants = applyFilters(searchedRestaurants) as Restaurant[];
      
      setFilteredMeals(finalFilteredMeals);
      setFilteredRestaurants(finalFilteredRestaurants);
      
      console.log(`🔍 Enhanced search results: ${searchedMeals.length} meals, ${searchedRestaurants.length} restaurants`);
      console.log(`✅ Final filtered results: ${finalFilteredMeals.length} meals, ${finalFilteredRestaurants.length} restaurants`);
      
    } catch (error) {
      console.error('❌ Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterToggle = (filter: string) => {
    const newFilters = activeFilters.includes(filter) 
      ? activeFilters.filter(f => f !== filter) 
      : [...activeFilters, filter];
    
    setActiveFilters(newFilters);
    console.log(`🎯 Filter toggled: ${filter}, Active filters:`, newFilters);
  };

  const handleAddToPlan = async (item: Meal) => {
    if (!isLoggedIn) {
      router.push('/(auth)/customer-login');
      return;
    }
    
    try {
      const result = await MealPlanService.addMealToPlan({
        id: item.id,
        name: item.name,
        description: item.description,
        image: item.image,
        tags: item.tags,
        calories: '300 Cal Per Serving',
        price: item.price,
        restaurant: item.restaurant
      });
      
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
      console.error('Error adding meal to plan:', error);
      setToastVisible(true);
      setToastMessage('Failed to add meal to plan. Please try again.');
      setToastType('error');
    }
  };

  const handleViewRestaurant = (item: Restaurant) => {
    router.push({
      pathname: '/restaurant-profile',
      params: {
        id: item.id,
        name: item.name,
        rating: item.rating.toString(),
        reviewCount: item.reviewCount.toString(),
        imageSource: JSON.stringify(item.image),
        tags: JSON.stringify(item.tags),
        distance: item.distance || '2.0 km',
        deliveryTime: '25-35 min'
      }
    });
  };

  function handleBack() {
    try {
    router.back();
    } catch {
      router.replace('/(customer-tabs)/home');
    }
  }

  const handleLocationFilter = () => {
    setComingSoonVisible(true);
  };

  const renderItem = (item: Meal | Restaurant) => (
    item.type === "meal" ? (
      <TouchableOpacity
        key={item.id}
        activeOpacity={0.85}
        onPress={() => router.push({
          pathname: '/meal/[id]',
          params: {
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price.toString(),
            imageSource: JSON.stringify(item.image),
            tags: JSON.stringify(item.tags),
            restaurant: item.restaurant || ''
          }
        })}
        style={{ backgroundColor: colors.white, borderRadius: 16, padding: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1 }}
      >
      <Image source={item.image} style={{ width: 56, height: 56, borderRadius: 12, marginRight: 12 }} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: '700', fontSize: 15, color: colors.primary, marginBottom: 2 }}>
            {item.name}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 }}>
          {item.tags.map((tag) => (
            <View key={tag} style={{ backgroundColor: '#E9F5EE', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, marginRight: 6, marginBottom: 2 }}>
              <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '600' }}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
        <Button
          title="Add to Plan"
          variant="primary"
          style={{ borderRadius: 8, paddingHorizontal: 14, paddingVertical: 6, minWidth: 90 }}
          onPress={() => handleAddToPlan(item as Meal)}
        />
      </TouchableOpacity>
    ) : item.type === "restaurant" ? (
      <View
        key={item.id}
        style={{ backgroundColor: colors.white, borderRadius: 16, padding: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1 }}
      >
        <Image source={item.image} style={{ width: 56, height: 56, borderRadius: 12, marginRight: 12 }} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: '700', fontSize: 15, color: colors.primary, marginBottom: 2 }}>
            {item.name}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 }}>
            {item.tags.map((tag) => (
              <View key={tag} style={{ backgroundColor: '#E9F5EE', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, marginRight: 6, marginBottom: 2 }}>
                <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '600' }}>{tag}</Text>
              </View>
            ))}
            <View style={{ backgroundColor: '#F7F5F0', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, marginRight: 6, marginBottom: 2 }}>
              <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '600' }}>{(item as Restaurant).distance}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={{ fontSize: 12, color: colors.gray, marginLeft: 4 }}>
              {(item as Restaurant).rating} ({(item as Restaurant).reviewCount} reviews)
            </Text>
          </View>
        </View>
        <Button
          title="View"
          variant="primary"
          style={{ borderRadius: 8, paddingHorizontal: 18, paddingVertical: 6, minWidth: 70 }}
          onPress={() => handleViewRestaurant(item as Restaurant)}
        />
    </View>
    ) : null
  );

  const currentItems = activeTab === 'meals' ? filteredMeals : filteredRestaurants;

  console.log('📊 Current state - activeTab:', activeTab, 'filteredMeals:', filteredMeals.length, 'filteredRestaurants:', filteredRestaurants.length, 'currentItems:', currentItems.length);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.lightGray, marginTop: 40 }}>
      <StatusBar barStyle="light-content" backgroundColor="#f7f5f0" />
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginTop: 12, paddingHorizontal: 12 }}>
          <TouchableOpacity style={{ marginRight: 8 }} onPress={handleBack}>
            <Ionicons name="arrow-back" size={22} color={colors.black} />
          </TouchableOpacity>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 12, paddingHorizontal: 10, height: 44, borderWidth: 1, borderColor: colors.gray }}>
            <Ionicons name="search" size={18} color={colors.gray} style={{ marginRight: 6 }} />
            <RNTextInput
              placeholder="Search for meals, restaurants..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{ flex: 1, fontSize: 15, color: colors.black }}
              placeholderTextColor={colors.gray}
            />
            {loading && <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 8 }} />}
            <TouchableOpacity onPress={handleLocationFilter}>
              <Ionicons name="options" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 32 }}>

        <View style={{ flexDirection: 'row', marginBottom: 10 }}>
          <Button
            title="Meals"
            variant={activeTab === 'meals' ? 'primary' : 'outlineGray'}
            onPress={() => setActiveTab('meals')}
            style={{ flex: 1, marginRight: 6, borderRadius: 8, paddingVertical: 10 }}
          />
          <Button
            title="Restaurants"
            variant={activeTab === 'restaurants' ? 'primary' : 'outlineGray'}
            onPress={() => setActiveTab('restaurants')}
            style={{ flex: 1, marginLeft: 6, borderRadius: 8, paddingVertical: 10 }}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }} contentContainerStyle={{ gap: 8 }}>
          {smartFilters.map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => handleFilterToggle(filter)}
              style={{
                backgroundColor: activeFilters.includes(filter) ? colors.primary : colors.white,
                borderColor: activeFilters.includes(filter) ? colors.primary : colors.gray,
                borderWidth: 1,
                borderRadius: 16,
                paddingHorizontal: 14,
                paddingVertical: 8,
                marginRight: 8,
              }}
            >
              <Text style={{ 
                color: activeFilters.includes(filter) ? colors.white : colors.primary, 
                fontWeight: '600', 
                fontSize: 13 
              }}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
          {activeFilters.length > 0 && (
            <TouchableOpacity
              onPress={() => setActiveFilters([])}
              style={{
                backgroundColor: '#ff4444',
                borderRadius: 16,
                paddingHorizontal: 12,
                paddingVertical: 8,
                marginLeft: 8,
              }}
            >
              <Text style={{ color: colors.white, fontWeight: '600', fontSize: 12 }}>
                Clear All
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        {showResults || (searchQuery.trim() === '' && (filteredMeals.length > 0 || filteredRestaurants.length > 0)) ? (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '700', fontSize: 16, color: colors.black }}>
                  {searchQuery.trim() === '' 
                    ? `All ${activeTab}` 
                    : (personalizationInfo.isPersonalized ? 'Personalized Results' : 'Search Results')
                  } ({currentItems.length} {activeTab})
              </Text>
                {personalizationInfo.isPersonalized && searchQuery.trim() !== '' && (
                  <Text style={{ fontSize: 12, color: colors.primary, fontWeight: '500', marginTop: 2 }}>
                    Results tailored to your dietary preferences
                  </Text>
                )}
                {searchQuery.trim() === '' && personalizationInfo.isPersonalized && (
                  <Text style={{ fontSize: 12, color: colors.primary, fontWeight: '500', marginTop: 2 }}>
                    Showing meals tailored to your dietary preferences
                  </Text>
                )}
              </View>
            </View>
            {currentItems.length > 0 ? (
              currentItems.map(renderItem)
            ) : (
              <View style={{ alignItems: 'center', marginTop: 40 }}>
                <Ionicons name="search" size={48} color={colors.gray} style={{ marginBottom: 12 }} />
                <Text style={{ fontSize: 16, color: colors.gray, textAlign: 'center' }}>
                  No {activeTab} found for "{searchQuery}"
                </Text>
                <Text style={{ fontSize: 14, color: colors.gray, textAlign: 'center', marginTop: 4 }}>
                  {personalizationInfo.isPersonalized 
                    ? 'Try different keywords or adjust your dietary preferences'
                    : 'Try different keywords or filters'
                  }
                </Text>
                {personalizationInfo.isPersonalized && (
                  <TouchableOpacity 
                    onPress={() => router.push('/meal-plan-builder')}
                    style={{ marginTop: 12 }}
                  >
                    <Text style={{ fontSize: 14, color: colors.primary, fontWeight: '500' }}>
                      Update dietary preferences
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </>
        ) : (
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Ionicons name="search" size={64} color={colors.gray} style={{ marginBottom: 16 }} />
            <Text style={{ fontSize: 18, color: colors.black, fontWeight: '600', marginBottom: 8 }}>
              {personalizationInfo.isPersonalized ? 'Personalized Search' : 'Search for meals & restaurants'}
            </Text>
            <Text style={{ fontSize: 14, color: colors.gray, textAlign: 'center', marginBottom: 12 }}>
              {personalizationInfo.isPersonalized 
                ? 'Search results will be tailored to your dietary preferences'
                : 'Find your favorite healthy meals and discover new restaurants near you'
              }
            </Text>
          </View>
        )}
      </ScrollView>
      
      {/* Coming Soon Toast */}
      <ComingSoonToast
        visible={comingSoonVisible}
        feature="Location-based filtering"
        onClose={() => setComingSoonVisible(false)}
        duration={4000}
      />
      
      {/* Notification Toast */}
      <NotificationToast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
        actionText={toastType === 'cart' ? 'View Cart' : undefined}
        onActionPress={toastType === 'cart' ? () => router.push('/(customer-tabs)/order') : undefined}
      />
    </SafeAreaView>
  );
}