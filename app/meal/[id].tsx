import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StatusBar, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getHybridMealById } from '../../services/hybridMealService';
import { useCart } from '../../cart-context';
import { CartToast } from '../../components/CartToast';
import { colors } from '../../theme/colors';
import MealPlanService from '../../services/mealPlanService';

// Interface for displaying meal details
interface MealDetail {
  id: string;  // Changed to string to match backend
  name: string;
  description: string;
  dietaryTags: string[];
  nutritionalInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    iron?: number;
  };
  allergens: string[];
  restaurantId: string | null;
  restaurant: string;
  image: any;
  price: number;
  available: boolean;
}

export default function MealDetailScreen() {
  const router = useRouter();
  const { id, name, description, price, calories, imageSource, tags, restaurant, restaurantId, restaurantName } = useLocalSearchParams();
  const { addToCart } = useCart();
  const [meal, setMeal] = useState<MealDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    fetchMealDetails();
  }, [id]);

  const fetchMealDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      // First try to get meal from hybrid service
      console.log('🍽️ Fetching meal details from hybrid service for ID:', id);
      const response = await getHybridMealById(id as string);
      
      if (response.success && response.data) {
        const foundMeal = response.data;
        
        const mealDetail: MealDetail = {
          id: foundMeal.id,
          name: foundMeal.name,
          description: foundMeal.description,
          dietaryTags: foundMeal.dietaryTags,
          nutritionalInfo: {
            calories: foundMeal.nutritionalInfo?.calories ?? 400,
            protein: foundMeal.nutritionalInfo?.protein ?? 20,
            carbs: foundMeal.nutritionalInfo?.carbs ?? 30,
            fat: foundMeal.nutritionalInfo?.fat ?? 15,
            fiber: foundMeal.nutritionalInfo?.fiber ?? 5,
            iron: 10
          },
          allergens: foundMeal.allergens,
          restaurantId: foundMeal.restaurantId,
          restaurant: foundMeal.restaurant?.name || `Restaurant ${foundMeal.restaurantId || 'Unknown'}`,
          image: foundMeal.image || { uri: 'https://via.placeholder.com/320x220/758F76/FFFFFF?text=No+Image' },
          price: parseFloat(foundMeal.price) || 3000,
          available: foundMeal.isAvailable === 1
        };
        
        setMeal(mealDetail);
        console.log('✅ Loaded meal details from hybrid service!');
      } else if (name && description && price) {
        // Fallback to parameters passed from navigation
        console.log('🔄 Using meal data from navigation parameters...');
        
        const mealDetail: MealDetail = {
          id: id as string,
          name: name as string,
          description: description as string,
          dietaryTags: tags ? JSON.parse(tags as string) : [],
          nutritionalInfo: {
            calories: calories ? parseInt(calories as string) : 400,
            protein: 20,
            carbs: 30,
            fat: 15,
            fiber: 5,
            iron: 10
          },
          allergens: [],
          restaurantId: restaurantId as string || null,
          restaurant: restaurant as string || restaurantName as string || 'Restaurant',
          image: imageSource ? JSON.parse(imageSource as string) : { uri: 'https://via.placeholder.com/320x220/758F76/FFFFFF?text=No+Image' },
          price: parseFloat(price as string) || 3000,
          available: true
        };
        
        setMeal(mealDetail);
        console.log('✅ Loaded meal details from navigation parameters!');
      } else {
        setError('Meal not found');
      }
    } catch (err: any) {
      console.error('❌ Error fetching meal details:', err);
      setError('Failed to load meal details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (meal) {
      addToCart(meal);
      setShowToast(true);
    }
  };

  const handleAddToPlan = async () => {
    if (meal) {
      try {
        const result = await MealPlanService.addMealToPlan({
          id: meal.id,
          name: meal.name,
          description: meal.description,
          image: meal.image,
          tags: meal.dietaryTags,
          calories: meal.nutritionalInfo.calories.toString(),
          price: meal.price,
          restaurant: meal.restaurant
        });
        if (result.success) {
          Alert.alert('Success', result.message || 'Meal added to plan!');
        } else {
          Alert.alert('Error', result.message || 'Failed to add meal to plan.');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to add meal to plan.');
      }
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#f7f5f0] justify-center items-center">
        <ActivityIndicator size="large" color="#10b981" />
        <Text className="text-gray-600 mt-4">Loading meal details...</Text>
      </View>
    );
  }

  if (error || !meal) {
    return (
      <View className="flex-1 bg-[#f7f5f0] justify-center items-center px-5">
        <Ionicons name="warning" size={48} color="#ef4444" />
        <Text className="text-red-600 text-center mt-4 text-lg font-semibold">Error</Text>
        <Text className="text-red-500 text-center mt-2">{error || 'Meal not found'}</Text>
        <TouchableOpacity 
          onPress={fetchMealDetails}
          className="bg-green-600 px-6 py-3 rounded-xl mt-4"
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => router.back()}
          className="mt-4"
        >
          <Text className="text-green-600 font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#f7f5f0]">
      <StatusBar barStyle="dark-content" backgroundColor="#f7f5f0" />
      
      {/* Cart Toast Notification */}
      <CartToast 
        visible={showToast}
        mealName={meal.name}
        onClose={() => setShowToast(false)}
      />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-12 pb-4">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="#22223B" />
          </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">Meal Detail</Text>
        <View className="w-8" />
      </View>

      {/* Responsive Scrollable Content */}
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {/* Meal Image Container */}
        <View 
          className="mb-6 overflow-hidden items-center justify-center"
          style={{
            width: '100%',
            height: 260,
            borderRadius: 16,
            backgroundColor: '#758F76',
            alignSelf: 'center',
            marginBottom: 24
          }}
        >
          <Image 
            source={meal.image} 
            style={{
              width: 200,
              height: 200,
              borderRadius: 12,
            }}
            resizeMode="cover"
          />
        </View>
        
        {/* Meal Title and Restaurant */}
        <View className="flex-row flex-wrap mb-2">
          <Text className="text-xl font-bold" style={{ color: '#2f7d52' }}>
            {meal.name.split(' ')[0]}
          </Text>
          <Text className="text-xl font-semibold text-gray-900 ml-1">
            {meal.name.replace(meal.name.split(' ')[0], '')}
            </Text>
        </View>
        <Text className="text-base font-semibold text-gray-700 mb-1">
          {meal.restaurant}
        </Text>
        
        {/* Description */}
        <Text className="text-base font-bold text-gray-900 mt-2 mb-1">Description</Text>
        <Text className="text-base text-gray-700 mb-3">
          {meal.description}
        </Text>
        
        {/* Tags */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {meal.dietaryTags && meal.dietaryTags.map((tag) => (
            <View key={tag} style={{ backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4, marginRight: 8, marginBottom: 8 }}>
              <Text style={{ color: 'white', fontWeight: '600', fontSize: 13 }}>{tag}</Text>
            </View>
          ))}
        </View>

        {/* Price and Availability */}
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-2xl font-bold text-gray-900 mr-2">
            #{meal.price.toLocaleString()}
          </Text>
          <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 14, marginLeft: 8 }}>
            {meal.available ? 'Available' : 'Unavailable'}
          </Text>
        </View>

        {/* Nutrition Info */}
        <Text className="text-lg font-bold text-gray-900 mt-4 mb-2">Nutrition Info</Text>
        <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 18 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ color: '#000000', fontWeight: '600' }}>Calories</Text>
            <Text style={{ color: '#000000' }}>{meal.nutritionalInfo.calories} kcal</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ color: '#000000', fontWeight: '600' }}>Total Carbohydrates</Text>
            <Text style={{ color: '#000000' }}>{meal.nutritionalInfo.carbs} g</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ color: '#000000', fontWeight: '600' }}>Protein</Text>
            <Text style={{ color: '#000000' }}>{meal.nutritionalInfo.protein} g</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ color: '#000000', fontWeight: '600' }}>Fiber</Text>
            <Text style={{ color: '#000000' }}>{meal.nutritionalInfo.fiber} g</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ color: '#000000', fontWeight: '600' }}>Fats</Text>
            <Text style={{ color: '#000000' }}>{meal.nutritionalInfo.fat} g</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: '#000000', fontWeight: '600' }}>Potassium</Text>
            <Text style={{ color: '#000000' }}>{meal.nutritionalInfo.iron} mg</Text>
            </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Buttons */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 24, paddingTop: 8, backgroundColor: '#f7f5f0', position: 'absolute', left: 0, right: 0, bottom: 0 }}>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginRight: 10 }}
          onPress={handleAddToPlan}
        >
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Add to Plan</Text>
        </TouchableOpacity>
          <TouchableOpacity 
          style={{ flex: 1, backgroundColor: '#ffca28', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginLeft: 10 }}
            onPress={handleAddToCart}
          >
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Order Now</Text>
          </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}