import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Button } from '../../components/Button';
import MealCard from '../../components/MealCards';
import { getAllMeals } from '../../services/api';
import { mockApi } from '../../services/mockData';

export default function RestaurantHomeScreen() {
  const router = useRouter();
  const [meals, setMeals] = useState([]);
  const [isLoadingMeals, setIsLoadingMeals] = useState(true);
  const [mealsError, setMealsError] = useState('');

  // Fetch meals on component mount
  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    try {
      setIsLoadingMeals(true);
      setMealsError('');
      
      // Comment out backend API call and use mock data instead
      /*
      const response = await getAllMeals();
      
      if (response.success && response.data) {
        // Take only first 3 meals for menu snapshot
        setMeals(response.data.slice(0, 3) as any);
      } else {
        setMealsError('Failed to load meals');
      }
      */
      
      // Use mock API for development
      const mockMeals = await mockApi.getMeals();
      // Take only first 3 meals for menu snapshot
      setMeals(mockMeals.slice(0, 3) as any);
      
    } catch (error: any) {
      console.error('Error fetching meals:', error);
      setMealsError('Failed to load meals');
    } finally {
      setIsLoadingMeals(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f7f5f0]">
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View className="px-5 pt-4 flex-row items-center justify-between">
          <TouchableOpacity 
            className="flex-row items-center"
            onPress={() => router.push('/restaurant-profile?id=1&name=Health n Healthy')}
          >
            <Image source={require('../../assets/restaurant-logo.png')} className="w-10 h-10 rounded-full mr-3" />
            <View>
              <Text className="text-sm font-semibold text-gray-900">Health n Healthy</Text>
              <Text className="text-xs text-gray-500">View Profile</Text>
            </View>
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">Your Dashboard</Text>
          <TouchableOpacity onPress={() => router.push('/restaurant-notifications')}>
            <Ionicons name="notifications-outline" size={24} color="#22223B" />
          </TouchableOpacity>
        </View>
        {/* Dish of the week */}
        <View className="bg-white rounded-2xl mx-5 mt-5 p-4 flex-row items-center shadow-sm">
          <Image source={require('../../assets/breakfast.png')} className="w-16 h-16 rounded-xl mr-4" />
          <View className="flex-1">
            <Text className="text-xs text-gray-400 mb-1">Dish of the week | Ordered 12 times</Text>
            <Text className="text-lg font-bold text-green-800">Fruity Oats Delight</Text>
            <View className="flex-row mt-1">
              <Text className="bg-green-50 text-green-700 text-xs font-semibold px-2 py-1 rounded-lg mr-2">Low-Carb</Text>
              <Text className="bg-green-50 text-green-700 text-xs font-semibold px-2 py-1 rounded-lg">Sugar-Free</Text>
            </View>
          </View>
        </View>
        {/* Stats */}
        <View className="flex-row justify-between mx-5 mt-5">
          <View className="flex-1 bg-white rounded-2xl items-center py-4 mx-1 shadow-sm">
            <MaterialIcons name="shopping-bag" size={28} color="#2D6A4F" />
            <Text className="text-xl font-bold text-gray-900 mt-2">24</Text>
            <Text className="text-xs text-gray-500 mt-1">Today's Orders</Text>
          </View>
          <View className="flex-1 bg-white rounded-2xl items-center py-4 mx-1 shadow-sm">
            <FontAwesome5 name="star" size={24} color="#2D6A4F" />
            <Text className="text-xl font-bold text-gray-900 mt-2">Tofu Rice</Text>
            <Text className="text-xs text-gray-500 mt-1">Top Dish</Text>
          </View>
          <View className="flex-1 bg-white rounded-2xl items-center py-4 mx-1 shadow-sm">
            <MaterialIcons name="attach-money" size={28} color="#2D6A4F" />
            <Text className="text-xl font-bold text-gray-900 mt-2">₦12,500</Text>
            <Text className="text-xs text-gray-500 mt-1">Revenue</Text>
          </View>
        </View>

        {/* Menu Snapshot */}
        <View className="mx-5 mt-7">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-bold text-gray-900">Menu Snapshot</Text>
            <Text className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Mock Data</Text>
          </View>
          
          {isLoadingMeals ? (
            <View className="bg-white rounded-2xl p-8 items-center shadow-sm">
              <ActivityIndicator size="small" color="#2D6A4F" />
              <Text className="text-gray-500 mt-2">Loading meals...</Text>
            </View>
          ) : mealsError ? (
            <View className="bg-white rounded-2xl p-4 items-center shadow-sm">
              <Text className="text-red-600 text-sm">{mealsError}</Text>
              <TouchableOpacity className="mt-2" onPress={fetchMeals}>
                <Text className="text-green-700 font-semibold">Retry</Text>
              </TouchableOpacity>
            </View>
          ) : meals.length > 0 ? (
            <View className="space-y-3">
              {meals.map((meal: any) => (
                <View key={meal.id} className="bg-white rounded-2xl flex-row items-center px-4 py-3 shadow-sm mb-2">
                  <Image source={require('../../assets/breakfast.png')} className="w-14 h-14 rounded-lg mr-3" />
                  <View className="flex-1">
                    <Text className="font-semibold text-green-900 text-base">{meal.name}</Text>
                    <View className="flex-row mt-1 flex-wrap">
                      {meal.dietaryTags?.slice(0, 2).map((tag: string, idx: number) => (
                        <Text key={idx} className="bg-green-50 text-green-700 text-xs font-semibold px-2 py-1 rounded-lg mr-2 mb-1 capitalize">{tag}</Text>
                      ))}
                    </View>
                  </View>
                  <Text className="text-green-900 font-bold text-base ml-2">₦{Math.floor(meal.nutritionalInfo?.calories / 10) * 100 || '2500'}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View className="bg-white rounded-2xl p-4 items-center shadow-sm">
              <Text className="text-gray-500">No meals available</Text>
            </View>
          )}
          
          <TouchableOpacity className="flex-row items-center justify-end mt-2" onPress={() => router.push('/meal/recommended')}>
            <Text className="text-green-700 font-semibold mr-1">View full menu</Text>
            <Ionicons name="arrow-forward" size={18} color="#2D6A4F" />
          </TouchableOpacity>
        </View>
        {/* Quick Actions */}
        <View className="mx-5 mt-8">
          <Text className="text-base font-bold text-gray-900 mb-3">Quick Actions</Text>
          <View className="flex-row justify-between">
            <TouchableOpacity className="flex-1 bg-white rounded-2xl items-center py-5 mx-1 shadow-sm" onPress={() => router.push('/add-meal')}>
              <Ionicons name="add-circle-outline" size={32} color="#2D6A4F" />
              <Text className="text-green-900 font-semibold mt-2">Add Dish</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 bg-white rounded-2xl items-center py-5 mx-1 shadow-sm" onPress={() => {}}>
              <MaterialIcons name="shopping-bag" size={28} color="#2D6A4F" />
              <Text className="text-green-900 font-semibold mt-2">Orders</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 bg-white rounded-2xl items-center py-5 mx-1 shadow-sm" onPress={() => {}}>
              <Ionicons name="chatbubble-ellipses-outline" size={28} color="#2D6A4F" />
              <Text className="text-green-900 font-semibold mt-2">Reviews</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}