import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getAllMeals, getUserMeals, DietaryPreferences, Meal as BackendMeal } from '../../services/api';
import { getHybridMeals } from '../../services/hybridMealService';
import { useCart } from '../../cart-context';
import { CartToast } from '../../components/CartToast';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Interface for displaying meals (converted from backend)
interface DisplayMeal {
  id: string;  // Changed to string to match backend
  name: string;
  description: string;
  dietaryTags: string[];
  nutritionalInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    iron: number;
  };
  allergens: string[];
  restaurantId: string | null;
  restaurant: string;
  image: any;
  price: number;
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function RecommendedMealsScreen() {
  const router = useRouter();
  const [meals, setMeals] = useState<DisplayMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dietaryPrefs, setDietaryPrefs] = useState<DietaryPreferences | null>(null);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [dataSource, setDataSource] = useState<'backend' | 'backend-filtered' | 'backend-all' | 'hybrid-filtered' | 'hybrid-all'>('hybrid-all');
  const { addToCart } = useCart();
  const [showToast, setShowToast] = useState(false);
  const [toastMealName, setToastMealName] = useState('');

  useEffect(() => {
    loadDietaryPreferences();
    fetchMeals();
  }, []);

  const loadDietaryPreferences = async () => {
    try {
      const dietaryData = await AsyncStorage.getItem('dietaryPreferences');
      if (dietaryData) {
        const parsed = JSON.parse(dietaryData);
        setDietaryPrefs(parsed);
        console.log('🍎 Loaded dietary preferences for recommendations:', parsed);
      }
    } catch (error) {
      console.error('Error loading dietary preferences:', error);
    }
  };

  // Filter meals based on dietary preferences
  const filterMealsByPreferences = (meals: BackendMeal[]): BackendMeal[] => {
    if (!dietaryPrefs || (!dietaryPrefs.dietaryRestrictions.length && !dietaryPrefs.preferredMealTags.length && !dietaryPrefs.healthGoal)) {
      return meals;
    }

    console.log('🎯 Filtering meals for preferences:', dietaryPrefs);

    const filtered = meals.filter(meal => {
      let score = 0;
      
      // Health Goal Matching (Primary Filter)
      if (dietaryPrefs.healthGoal) {
        const goal = dietaryPrefs.healthGoal;
        const healthGoalMatches = (() => {
          switch (goal.toLowerCase()) {
            case 'weight loss':
              return meal.dietaryTags.some(tag => 
                ['low-carb', 'low-calorie', 'high-protein', 'keto-friendly', 'diabetic-friendly'].includes(tag.toLowerCase())
              ) || (meal.nutritionalInfo?.calories && meal.nutritionalInfo.calories < 400);
            
            case 'muscle gain':
              return meal.dietaryTags.some(tag => 
                ['high-protein', 'protein-rich', 'muscle-building', 'post-workout'].includes(tag.toLowerCase())
              ) || (meal.nutritionalInfo?.protein && meal.nutritionalInfo.protein > 25);
            
            case 'heart health':
              return meal.dietaryTags.some(tag => 
                ['omega-3', 'heart-healthy', 'low-sodium', 'antioxidants', 'whole-grain'].includes(tag.toLowerCase())
              );
            
            case 'diabetes management':
              return meal.dietaryTags.some(tag => 
                ['diabetic-friendly', 'low-carb', 'low-sugar', 'high-fiber', 'sugar-free'].includes(tag.toLowerCase())
              );
            
            case 'digestive health':
              return meal.dietaryTags.some(tag => 
                ['high-fiber', 'probiotic', 'digestive-friendly', 'gut-health'].includes(tag.toLowerCase())
              );
            
            case 'energy boost':
              return meal.dietaryTags.some(tag => 
                ['energy-boosting', 'iron-rich', 'vitamin-b', 'whole-grain', 'breakfast'].includes(tag.toLowerCase())
              );
            
            default:
              return meal.dietaryTags.some(tag => 
                tag.toLowerCase().includes(goal.toLowerCase())
              );
          }
        })();
        
        if (healthGoalMatches) score += 3;
      }

      // Dietary Restrictions Matching (Must Match)
      if (dietaryPrefs.dietaryRestrictions.length > 0) {
        const restrictionMatches = dietaryPrefs.dietaryRestrictions.every(restriction => {
          switch (restriction.toLowerCase()) {
            case 'vegetarian':
              return meal.dietaryTags.some(tag => 
                ['vegetarian', 'vegan', 'plant-based'].includes(tag.toLowerCase())
              ) && !meal.allergens.some(allergen => 
                ['meat', 'poultry', 'fish'].includes(allergen.toLowerCase())
              );
            
            case 'vegan':
              return meal.dietaryTags.some(tag => 
                ['vegan', 'plant-based'].includes(tag.toLowerCase())
              ) && !meal.allergens.some(allergen => 
                ['meat', 'poultry', 'fish', 'dairy', 'eggs'].includes(allergen.toLowerCase())
              );
            
            case 'gluten-free':
              return meal.dietaryTags.some(tag => 
                tag.toLowerCase().includes('gluten-free')
              ) && !meal.allergens.some(allergen => 
                allergen.toLowerCase().includes('gluten')
              );
            
            case 'dairy-free':
              return !meal.allergens.some(allergen => 
                ['dairy', 'milk', 'cheese', 'lactose'].includes(allergen.toLowerCase())
              );
            
            case 'nut-free':
              return !meal.allergens.some(allergen => 
                ['nuts', 'peanuts', 'tree nuts', 'almonds'].includes(allergen.toLowerCase())
              );
            
            default:
              return meal.dietaryTags.some(tag => 
                tag.toLowerCase().includes(restriction.toLowerCase())
              );
          }
        });
        
        if (!restrictionMatches) return false; // Must satisfy all restrictions
        score += 2;
      }

      // Preferred Meal Tags Matching (Bonus)
      if (dietaryPrefs.preferredMealTags.length > 0) {
        const tagMatches = dietaryPrefs.preferredMealTags.some(preferred => 
          meal.dietaryTags.some(tag => 
            tag.toLowerCase().includes(preferred.toLowerCase()) ||
            preferred.toLowerCase().includes(tag.toLowerCase())
          )
        );
        
        if (tagMatches) score += 1;
      }

      return score > 0;
    });

    // Sort by relevance (meals with higher scores first)
    const sortedFiltered = filtered.sort((a, b) => {
      // Calculate scores for sorting
      let scoreA = 0, scoreB = 0;
      
      if (dietaryPrefs.healthGoal) {
        // Add health goal relevance scoring
        const goal = dietaryPrefs.healthGoal;
        const healthGoalScoreA = a.dietaryTags.some(tag => tag.toLowerCase().includes(goal.toLowerCase())) ? 1 : 0;
        const healthGoalScoreB = b.dietaryTags.some(tag => tag.toLowerCase().includes(goal.toLowerCase())) ? 1 : 0;
        
        scoreA += healthGoalScoreA * 3;
        scoreB += healthGoalScoreB * 3;
      }
      
      return scoreB - scoreA;
    });

    console.log(`🎯 Filtered ${meals.length} meals to ${sortedFiltered.length} based on health goal: ${dietaryPrefs.healthGoal}`);
    setIsPersonalized(sortedFiltered.length !== meals.length && sortedFiltered.length > 0);
    
    return sortedFiltered.length > 0 ? sortedFiltered : meals.slice(0, 10); // Fallback to first 10 if no matches
  };

  // Convert backend meal to display meal
  const convertBackendMealToDisplayMeal = (meal: BackendMeal, index: number): DisplayMeal => {
    return {
      id: meal.id,  // Backend uses string IDs
      name: meal.name,
      description: meal.description,
      dietaryTags: meal.dietaryTags,
      nutritionalInfo: {
        calories: meal.nutritionalInfo?.calories || 400,
        protein: meal.nutritionalInfo?.protein || 20,
        carbs: meal.nutritionalInfo?.carbs || 30,
        fat: meal.nutritionalInfo?.fat || 15,
        fiber: 5, // Default since backend doesn't provide
        iron: 10  // Default since backend doesn't provide
      },
      allergens: meal.allergens,
      restaurantId: meal.restaurantId,
      restaurant: meal.restaurant?.name || `Restaurant ${meal.restaurantId || 'Unknown'}`,
      // Use hybrid meal image if available, otherwise placeholder
      image: meal.image || { uri: 'https://via.placeholder.com/320x220/758F76/FFFFFF?text=No+Image' },
      price: parseFloat(meal.price) || 3000, // Convert string price to number
      available: meal.isAvailable === 1, // Convert 1/0 to boolean
      createdAt: meal.createdAt,
      updatedAt: meal.updatedAt
    };
  };

  const fetchMeals = async () => {
    try {
      console.log('🍽️ Fetching meals from hybrid service...');
      setLoading(true);
      setError('');
      
      // First try personalized meals if user has auth token and dietary preferences
      const authToken = await AsyncStorage.getItem('auth_token');
      if (authToken && dietaryPrefs) {
        try {
          console.log('🌐 Attempting to load personalized meals from backend...');
          const response = await getUserMeals();
      
          if (response.success && response.data && response.data.length > 0) {
            console.log('✅ Loaded personalized meals from backend!');
            const convertedMeals = response.data.map((meal, index) => convertBackendMealToDisplayMeal(meal, index));
            setMeals(convertedMeals);
            setDataSource('backend');
            setIsPersonalized(true);
            return;
          }
        } catch (apiError) {
          console.log('🔄 Personalized meals unavailable, trying hybrid meals...');
        }
      }
      
      // Load hybrid meals (backend + comprehensive local)
      console.log('🌐 Loading hybrid meals...');
      const response = await getHybridMeals();
      
      if (response.success && response.data && response.data.length > 0) {
        console.log('✅ Loaded hybrid meals successfully!');
        
        // Filter based on dietary preferences if available
        const filteredMeals = filterMealsByPreferences(response.data);
        const convertedMeals = filteredMeals.map((meal, index) => convertBackendMealToDisplayMeal(meal, index));
        
        setMeals(convertedMeals);
        setDataSource(filteredMeals.length !== response.data.length ? 'hybrid-filtered' : 'hybrid-all');
        setIsPersonalized(filteredMeals.length !== response.data.length);
      } else {
        setError('No meals available');
      }
      
    } catch (e: any) {
      console.error('❌ Fetch meals error:', e);
      setError(e.message || 'Failed to fetch meals');
    } finally {
      setLoading(false);
    }
  };

  const handleMealPress = (mealId: string) => {
    router.push(`/meal/${mealId}`);
  };

  const handleAddToCart = (meal: DisplayMeal, event: any) => {
    // Prevent navigation to detail screen
    event.stopPropagation();
    
    addToCart(meal);
    setToastMealName(meal.name);
    setShowToast(true);
  };

  const renderMealCard = (meal: DisplayMeal) => (
    <TouchableOpacity 
      key={meal.id} 
      className="bg-white rounded-2xl p-4 mb-4 shadow-sm"
      onPress={() => handleMealPress(meal.id)}
    >
      {/* Meal Image */}
      <View 
        className="w-full overflow-hidden mb-4 items-center justify-center mx-auto"
        style={{
          height: 140,
          borderRadius: 16,
          backgroundColor: '#758F76'
        }}
      >
        <Image 
          source={meal.image} 
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 16,
          }}
          resizeMode="cover"
        />
      </View>

      {/* Meal Info */}
      <View className="flex-row flex-wrap mb-1">
        <Text className="text-lg font-bold" style={{ color: '#2f7d52' }}>
          {meal.name.split(' ')[0]}
        </Text>
        {meal.name.split(' ').length > 1 && (
          <Text className="text-lg font-bold text-gray-900 ml-1">
            {meal.name.split(' ').slice(1).join(' ')}
          </Text>
        )}
      </View>
      <Text className="text-sm text-gray-600 mb-3">{meal.restaurant}</Text>
      
      {/* Description */}
      <Text className="text-sm text-gray-600 mb-3 leading-5" numberOfLines={2}>
        {meal.description}
      </Text>

      {/* Tags */}
      <View className="flex-row flex-wrap gap-1 mb-3">
        {meal.dietaryTags.slice(0, 3).map((tag, index) => (
          <View key={index} className="bg-green-100 px-2 py-1 rounded-full">
            <Text className="text-green-700 text-xs font-medium">{tag}</Text>
          </View>
        ))}
        {meal.dietaryTags.length > 3 && (
          <View className="bg-gray-100 px-2 py-1 rounded-full">
            <Text className="text-gray-600 text-xs font-medium">+{meal.dietaryTags.length - 3}</Text>
          </View>
        )}
      </View>

      {/* Price, Calories and Add Button */}
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-lg font-bold text-gray-900">₦{meal.price.toLocaleString()}</Text>
          <Text className="text-sm text-gray-600">{meal.nutritionalInfo.calories} kcal</Text>
        </View>
        <TouchableOpacity 
          onPress={(e) => handleAddToCart(meal, e)}
          className="bg-green-600 px-4 py-2 rounded-xl"
        >
          <Text className="text-white font-semibold text-sm">Add</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-[#f7f5f0]">
      {/* Cart Toast Notification */}
      <CartToast 
        visible={showToast}
        mealName={toastMealName}
        onClose={() => setShowToast(false)}
      />

      {/* Header */}
      <View className="flex-row items-center px-5 pt-12 pb-4 bg-[#f7f5f0]">
        <TouchableOpacity className="mr-3" onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#22223B" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-xl font-bold text-center text-gray-900">
            Recommended Meals
          </Text>
          {isPersonalized && dietaryPrefs && (
            <Text className="text-xs text-center text-green-600 mt-1">
              🎯 {dataSource.includes('backend') ? 'Backend' : 'Hybrid'} {isPersonalized ? 'Personalized' : 'Filtered'} • {dietaryPrefs.healthGoal.replace('_', ' ')}
            </Text>
          )}
        </View>
        <TouchableOpacity onPress={fetchMeals} className="p-2">
          <Ionicons name="refresh" size={20} color="#10b981" />
        </TouchableOpacity>
      </View>
      
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {loading ? (
          <View className="flex-1 justify-center items-center py-20">
            <ActivityIndicator size="large" color="#10b981" />
            <Text className="text-gray-600 mt-4">Loading meals...</Text>
          </View>
        ) : error ? (
          <View className="flex-1 justify-center items-center py-20">
            <Ionicons name="warning" size={48} color="#ef4444" />
            <Text className="text-red-600 text-center mt-4 text-lg font-semibold">Error</Text>
            <Text className="text-red-500 text-center mt-2 px-4">{error}</Text>
            <TouchableOpacity 
              onPress={fetchMeals}
              className="bg-green-600 px-6 py-3 rounded-xl mt-4"
            >
              <Text className="text-white font-semibold">Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="py-4">
            <View className="mb-4">
              <Text className="text-lg font-bold text-gray-900">
                {meals.length} recommended meals for you
            </Text>
              {dietaryPrefs && (
                <Text className="text-sm text-gray-600 mt-1">
                  {dataSource === 'backend' ? '🌐 From your backend preferences' : 
                   dataSource === 'backend-filtered' ? '🌐 Backend meals filtered by preferences' :
                   dataSource === 'backend-all' ? '🌐 All backend meals' :
                   dataSource === 'hybrid-filtered' ? '🎯 Hybrid meals filtered by preferences' :
                   dataSource === 'hybrid-all' ? '🎯 All hybrid meals' :
                   '📋 All available meals'}
                  {dietaryPrefs && dietaryPrefs.dietaryRestrictions.length > 0 && (
                    <Text className="text-green-600"> • {dietaryPrefs.dietaryRestrictions.join(', ')}</Text>
                  )}
                </Text>
              )}
            </View>
            
            {meals.map(renderMealCard)}
            
            {/* Bottom spacing */}
            <View className="h-8" />
          </View>
        )}
      </ScrollView>
    </View>
  );
}