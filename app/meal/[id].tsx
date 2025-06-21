import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StatusBar, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getHybridMealById } from '../../services/hybridMealService';
import { useCart } from '../../cart-context';
import { CartToast } from '../../components/CartToast';

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

      {/* Fixed Content - Image, Title, Description, Tags, Price */}
      <View className="px-5">
        {/* Meal Image Container */}
        <View 
          className="mb-6 overflow-hidden items-center justify-center"
          style={{
            width: 375,
            height: 260,
            borderRadius: 16,
            backgroundColor: '#758F76'
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
          {meal.name.split(' ').length > 1 && (
            <Text className="text-xl font-bold text-gray-900 ml-1">
              {meal.name.split(' ').slice(1).join(' ')}
            </Text>
          )}
        </View>
        <Text className="text-sm text-gray-600 mb-4">{meal.restaurant}</Text>
        
        {/* Description */}
        <Text className="text-sm font-semibold text-gray-900 mb-2">Description</Text>
        <Text className="text-sm text-gray-600 leading-5 mb-6">{meal.description}</Text>
        
        {/* Tags */}
        <View className="flex-row flex-wrap gap-2 mb-6">
          {meal.dietaryTags.map((tag, index) => (
            <View key={index} className="bg-green-100 px-3 py-1 rounded-full">
              <Text className="text-green-700 text-xs font-medium">{tag}</Text>
            </View>
          ))}
        </View>

        {/* Price and Availability */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-bold text-gray-900">₦{meal.price.toLocaleString()}</Text>
          <Text className="text-sm text-green-600 font-medium">
            {meal.available ? 'Available' : 'Unavailable'}
          </Text>
        </View>

        {/* Nutrition Info Header */}
        <Text className="text-sm font-semibold text-gray-900 mb-3">Nutrition info</Text>
      </View>

      {/* Scrollable Nutrition Info Section */}
      <ScrollView 
        className="flex-1 px-5" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="bg-white rounded-xl p-4">
          <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
            <Text className="text-sm text-gray-600">Calories</Text>
            <Text className="text-sm text-gray-900 font-medium">{meal.nutritionalInfo.calories} kcal</Text>
          </View>
          <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
            <Text className="text-sm text-gray-600">Total Carbohydrates</Text>
            <Text className="text-sm text-gray-900 font-medium">{meal.nutritionalInfo.carbs} g</Text>
          </View>
          <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
            <Text className="text-sm text-gray-600">Protein</Text>
            <Text className="text-sm text-gray-900 font-medium">{meal.nutritionalInfo.protein} g</Text>
          </View>
          <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
            <Text className="text-sm text-gray-600">Fiber</Text>
            <Text className="text-sm text-gray-900 font-medium">{meal.nutritionalInfo.fiber} g</Text>
          </View>
          <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
            <Text className="text-sm text-gray-600">Fats</Text>
            <Text className="text-sm text-gray-900 font-medium">{meal.nutritionalInfo.fat} g</Text>
          </View>
          <View className="flex-row justify-between items-center py-2">
            <Text className="text-sm text-gray-600">Iron</Text>
            <Text className="text-sm text-gray-900 font-medium">{meal.nutritionalInfo.iron} mg</Text>
            </View>
        </View>
      </ScrollView>

      {/* Fixed Action Buttons at Bottom */}
      <View className="px-5 pb-6 pt-4 bg-[#f7f5f0]">
        <View className="flex-row gap-3">
          <TouchableOpacity 
            onPress={handleAddToCart}
            className="flex-1 bg-green-600 py-4 rounded-xl items-center"
          >
            <Text className="text-white font-semibold text-sm">Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}