import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';
import { mockApi, MockMeal } from '../../services/mockData';

interface Meal {
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

export default function RecommendedMealsScreen() {
  const router = useRouter();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    try {
      console.log('🍽️ Fetching meals...');
      setLoading(true);
      setError('');
      
      // Comment out backend API call and use sample data instead
      /*
      const response = await api.get<Meal[]>('/meals');
      
      if (response.success && response.data) {
        console.log('✅ Meals fetched successfully:', response.data);
        setMeals(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch meals');
      }
      */
      
      // Use mock API for development
      const sampleMeals = await mockApi.getMeals();
      console.log('✅ Sample meals loaded:', sampleMeals);
      setMeals(sampleMeals);
      
    } catch (e: any) {
      console.error('❌ Fetch meals error:', e);
      setError(e.message || 'Failed to fetch meals');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#f7f5f0]">
      {/* Header */}
      <View className="flex-row items-center px-5 pt-12 pb-4 bg-[#f7f5f0]">
        <TouchableOpacity className="mr-3" onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#22223B" />
        </TouchableOpacity>
        <Text className="flex-1 text-xl font-bold text-center text-gray-900">
          Recommended Meals (Mock Data)
        </Text>
        <TouchableOpacity onPress={fetchMeals} className="p-2">
          <Ionicons name="refresh" size={20} color="#10b981" />
        </TouchableOpacity>
      </View>
      
      <ScrollView className="flex-1 px-5">
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
            <Text className="text-lg font-bold text-gray-900 mb-4">
              Found {meals.length} meals
            </Text>
            
            {meals.map((meal) => (
              <View key={meal.id} className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                <Text className="text-lg font-bold text-gray-900 mb-2">{meal.name}</Text>
                <Text className="text-gray-600 mb-3">{meal.description}</Text>
                
                {/* Nutritional Info */}
                <View className="bg-gray-50 rounded-lg p-3 mb-3">
                  <Text className="font-semibold text-gray-700 mb-2">Nutrition (per serving)</Text>
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-gray-600">Calories: {meal.nutritionalInfo.calories}</Text>
                    <Text className="text-sm text-gray-600">Protein: {meal.nutritionalInfo.protein}g</Text>
                  </View>
                  <View className="flex-row justify-between mt-1">
                    <Text className="text-sm text-gray-600">Carbs: {meal.nutritionalInfo.carbs}g</Text>
                    <Text className="text-sm text-gray-600">Fat: {meal.nutritionalInfo.fat}g</Text>
                  </View>
                </View>

                {/* Dietary Tags */}
                {meal.dietaryTags.length > 0 && (
                  <View className="flex-row flex-wrap mb-2">
                    {meal.dietaryTags.map((tag, index) => (
                      <View key={index} className="bg-green-100 px-2 py-1 rounded-full mr-2 mb-1">
                        <Text className="text-green-700 text-xs font-medium">{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Allergens */}
                {meal.allergens.length > 0 && (
                  <View className="flex-row flex-wrap">
                    <Text className="text-xs text-gray-500 mr-2">Allergens:</Text>
                    {meal.allergens.map((allergen, index) => (
                      <Text key={index} className="text-xs text-red-600 mr-2">
                        {allergen}{index < meal.allergens.length - 1 ? ',' : ''}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}