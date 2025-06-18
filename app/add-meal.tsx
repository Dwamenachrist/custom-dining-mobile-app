import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, StatusBar, TextInput as RNTextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Button } from '../components/Button';
import { TextInput } from '../components/TextInput';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useAuth } from '../auth-context';
import { api } from '../services/api';
import { mockApi } from '../services/mockData';

const CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
const DIETARY_LABELS = ['Vegetarian', 'Diabetic-Friendly', 'Low-Carb', 'Gluten-Free', 'Vegan'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIME_SLOTS = ['7am - 10pm', '10am - 2pm', '2pm - 6pm', '6pm - 10pm'];

export default function AddMealScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const restaurantId = user?.restaurantId || '683c5e59a91c66e8f9486c17'; // Fallback ID for testing
  const [mealName, setMealName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Lunch');
  const [image, setImage] = useState<string | null>(null);
  const [nutrition, setNutrition] = useState({
    calories: '', carbs: '', protein: '', fiber: '', fats: '', iron: '', sugar: '', potassium: '', cholesterol: '', sodium: '', calcium: '',
  });
  const [labels, setLabels] = useState<string[]>([]);
  const [days, setDays] = useState<string[]>([]);
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0]);
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLabelToggle = (item: string) => setLabels((prev) => prev.includes(item) ? prev.filter(l => l !== item) : [...prev, item]);
  const handleDayToggle = (item: string) => setDays((prev) => prev.includes(item) ? prev.filter(d => d !== item) : [...prev, item]);
  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', quality: 0.7 });
    if (!result.canceled && result.assets.length > 0) setImage(result.assets[0].uri);
  };
  const handleNutritionChange = (key: string, value: string) => setNutrition((prev) => ({ ...prev, [key]: value }));
  
  const handleAddMeal = async () => {
    if (!mealName || !description || !price) {
      setError('Please fill in all required fields (Name, Description, Price).');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      const payload = {
        name: mealName,
        description,
        price: Number(price),
        dietaryTags: labels,
        restaurantId: restaurantId,
      };
      console.log('🍽️ Adding meal:', payload);
      
      // Comment out backend API call and use mock success instead
      /*
      const response = await api.post(`/meals`, payload);
      
      if (response.success) {
        console.log('✅ Meal added successfully!', response.data);
        setIsSubmitting(false);
        router.replace('/(restaurant-tabs)/home');
      } else {
        throw new Error(response.message || 'Failed to add meal');
      }
      */
      
      // Use mock API for development
      const result = await mockApi.addMeal(payload);
      
      if (result.success) {
        console.log('✅ Mock: Meal added successfully!', result);
        setIsSubmitting(false);
        router.replace('/(restaurant-tabs)/home');
      } else {
        throw new Error('Failed to add meal');
      }
      
    } catch (e: any) {
      console.error('❌ Add meal error:', e);
      setIsSubmitting(false);
      setError(e.message || 'Failed to add meal. Please try again.');
    }
  };

  return (
    <View className="flex-1 bg-[#f7f5f0]">
      <StatusBar barStyle="dark-content" />
      <View className="flex-row items-center px-5 pt-12 pb-4 bg-[#f7f5f0] z-10">
        <TouchableOpacity className="mr-3" onPress={() => router.back()} accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={24} color="#22223B" />
        </TouchableOpacity>
        <Text className="flex-1 text-xl font-bold text-center text-gray-900">Add New Meal</Text>
        <View className="w-8" />
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        {/* Meal Name */}
        <Text className="text-sm font-semibold text-gray-700 mb-2">Meal Name</Text>
        <TextInput placeholder="Grilled Chicken & Veggies" value={mealName} onChangeText={setMealName} className="mb-4" />
        
        {/* Description */}
        <Text className="text-sm font-semibold text-gray-700 mb-2">Description</Text>
        <TextInput placeholder="A protein-packed lunch perfect for weight loss." value={description} onChangeText={setDescription} className="mb-4" />
        
        {/* Category */}
        <Text className="text-sm font-semibold text-gray-700 mb-2">Category</Text>
        <View className="border border-gray-300 rounded-xl bg-white mb-4">
          <Picker selectedValue={category} onValueChange={setCategory} style={{ height: 50 }}>
            {CATEGORIES.map((cat) => <Picker.Item key={cat} label={cat} value={cat} />)}
          </Picker>
        </View>
        
        {/* Upload Meal Image */}
        <Text className="text-sm font-semibold text-gray-700 mb-2">Upload Meal Image</Text>
        <TouchableOpacity className="h-32 border border-dashed border-gray-300 rounded-xl bg-white items-center justify-center mb-6 relative" onPress={handleImagePick} activeOpacity={0.85}>
          {image ? (
            <>
              <Image source={{ uri: image }} className="w-28 h-28 rounded-xl" />
              <TouchableOpacity className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md z-10" onPress={() => setImage(null)} accessibilityLabel="Remove image">
                <Ionicons name="close" size={16} color="#e53e3e" />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={36} color="#10b981" />
              <Text className="text-gray-500 text-sm mt-2">Upload a clear image of the meal</Text>
            </>
          )}
        </TouchableOpacity>
        
        {/* Nutritional Info */}
        <View className="flex-row justify-between items-end mb-2">
          <Text className="text-base font-bold text-gray-900">Nutritional Info</Text>
          <Text className="text-xs text-gray-500">Per serving</Text>
        </View>
        <View className="bg-white rounded-xl p-4 mb-6">
          {[
            ['Calories', 'calories', 'kcal'],
            ['Total Carbohydrates', 'carbs', 'g'],
            ['Protein', 'protein', 'g'],
            ['Fiber', 'fiber', 'g'],
            ['Fats', 'fats', 'g'],
            ['Iron', 'iron', 'mg'],
            ['Sugar', 'sugar', 'g'],
            ['Potassium', 'potassium', 'mg'],
            ['Cholesterol', 'cholesterol', 'mg'],
            ['Sodium', 'sodium', 'mg'],
            ['Calcium', 'calcium', 'mg'],
          ].map(([label, key, unit], idx) => (
            <View key={key as string} className={`flex-row justify-between items-center ${idx !== 10 ? 'mb-3' : ''} ${idx % 2 === 1 ? 'bg-gray-50 rounded-lg px-3' : 'px-1'} py-2`}>
              <Text className="text-gray-700 text-sm font-medium">{label}</Text>
              <View className="flex-row items-center">
                <RNTextInput 
                  value={nutrition[key as keyof typeof nutrition]} 
                  onChangeText={(val) => handleNutritionChange(key as string, val)} 
                  placeholder="0" 
                  keyboardType="numeric" 
                  className="w-16 text-right text-gray-900 text-sm border-b border-gray-300 pb-1 mr-2" 
                />
                <Text className="text-gray-500 text-xs w-8">{unit}</Text>
              </View>
            </View>
          ))}
        </View>
        
        {/* Dietary Labels */}
        <Text className="text-base font-bold text-gray-900 mb-3">Dietary Labels</Text>
        <View className="flex-row flex-wrap mb-6">
          {DIETARY_LABELS.map((item) => (
            <TouchableOpacity key={item} onPress={() => handleLabelToggle(item)} className={`border-2 rounded-2xl px-4 py-2 mr-2 mb-2 ${labels.includes(item) ? 'bg-green-50 border-green-600' : 'bg-white border-gray-300'}` } activeOpacity={0.8}>
              <Text className={`font-semibold text-sm ${labels.includes(item) ? 'text-green-700' : 'text-gray-700'}`}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Availability Settings */}
        <Text className="text-base font-bold text-gray-900 mb-3">Availability Settings</Text>
        <View className="flex-row flex-wrap mb-3">
          {DAYS.map((item) => (
            <TouchableOpacity key={item} onPress={() => handleDayToggle(item)} className={`border-2 rounded-2xl px-3 py-2 mr-2 mb-2 ${days.includes(item) ? 'bg-green-50 border-green-600' : 'bg-white border-gray-300'}` } activeOpacity={0.8}>
              <Text className={`font-semibold text-sm ${days.includes(item) ? 'text-green-700' : 'text-gray-700'}`}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Time Slots */}
        <View className="border border-gray-300 rounded-xl bg-white mb-6">
          <Picker selectedValue={timeSlot} onValueChange={setTimeSlot} style={{ height: 50 }}>
            {TIME_SLOTS.map((slot) => <Picker.Item key={slot} label={slot} value={slot} />)}
          </Picker>
        </View>
        
        {/* Meal Pricing */}
        <Text className="text-base font-bold text-gray-900 mb-3">Meal Pricing</Text>
        <View className="flex-row items-center border border-gray-300 rounded-xl bg-white mb-6 px-4">
          <Text className="text-xl text-green-700 font-bold mr-3">₦</Text>
          <RNTextInput 
            value={price} 
            onChangeText={setPrice} 
            placeholder="2500" 
            keyboardType="numeric" 
            className="flex-1 text-lg text-gray-900 py-4" 
          />
        </View>
        
        {/* Error Message */}
        {error ? <Text className="text-red-600 text-center mb-4 text-sm font-medium">{error}</Text> : null}
        
        {/* Add Meal Button */}
        <Button 
          title={isSubmitting ? 'Adding...' : 'Add Meal to Menu'} 
          variant="primary" 
          onPress={handleAddMeal} 
          disabled={isSubmitting || !mealName || !description || !price}
          className="mb-4"
        />
        
        {isSubmitting && (
          <View className="items-center mt-2">
            <ActivityIndicator size="small" color="#10b981" />
          </View>
        )}
      </ScrollView>
    </View>
  );
} 