import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Image, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Button } from '../components/Button';
import { TextInput } from '../components/TextInput';
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../auth-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MealPlanService from '../services/mealPlanService';
import MealPlanToast from '../components/MealPlanToast';

const MEAL_GOALS = [
  'Balanced nutrition',
  'Manage diabetes',
  'Weight loss',
  'Plant-based',
  'Muscle building',
  'Heart healthy'
];

const PLAN_DURATIONS = ['3 days', '5 days', '7 days', '10 days', '15 days', '30 days'];

const DIETARY_RESTRICTIONS = [
  'Vegetarian',
  'Vegan',
  'Dairy-free',
  'Gluten-free',
  'Sugar-free',
  'Low-carb',
  'Keto',
  'Paleo'
];

const SAMPLE_MEALS = [
  {
    id: 'breakfast-1',
    type: 'Breakfast',
    name: 'Avocado Toast & Eggs',
    image: require('../assets/meals/Avocado Toast and Egg.png'),
    description: 'Healthy avocado toast with perfectly cooked eggs',
    calories: '320 Cal Per Serving',
    tags: ['High-Protein', 'Healthy'],
    price: 4500,
    restaurant: 'Meal Plan'
  },
  {
    id: 'lunch-1',
    type: 'Lunch',
    name: 'Basmati Jollof Rice',
    image: require('../assets/meals/Basmati Jollof Rice.png'),
    description: 'Premium basmati rice cooked in rich tomato sauce',
    calories: '520 Cal Per Serving',
    tags: ['Traditional', 'Gluten-Free'],
    price: 8500,
    restaurant: 'Meal Plan'
  },
  {
    id: 'dinner-1',
    type: 'Dinner',
    name: 'Grilled Fish and Veggies',
    image: require('../assets/meals/Grilled Fish and Veggies.png'),
    description: 'Fresh tilapia grilled with steamed vegetables',
    calories: '320 Cal Per Serving',
    tags: ['High-Protein', 'Omega-3'],
    price: 9500,
    restaurant: 'Meal Plan'
  },
  {
    id: 'snack-1',
    type: 'Snacks',
    name: 'Fruity Oats Delight',
    image: require('../assets/meals/Fruity Oats delight.png'),
    description: 'Nourishing oats with fresh fruits and chia seeds',
    calories: '310 Cal Per Serving',
    tags: ['Healthy', 'Vegetarian'],
    price: 5000,
    restaurant: 'Meal Plan'
  }
];

export default function MealPlanBuilderScreen() {
  const [mealGoal, setMealGoal] = useState(MEAL_GOALS[0]);
  const [planDuration, setPlanDuration] = useState(PLAN_DURATIONS[2]); // Default to 7 days
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [disliked, setDisliked] = useState('');
  const [selectedMeals, setSelectedMeals] = useState(SAMPLE_MEALS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'cart'>('success');
  
  const router = useRouter();
  const auth = useAuth();

  const handleRestrictionToggle = (item: string) => {
    setRestrictions((prev) =>
      prev.includes(item) ? prev.filter((r) => r !== item) : [...prev, item]
    );
  };

  const handleMealToggle = (mealId: string) => {
    setSelectedMeals(prev => {
      const isSelected = prev.some(meal => meal.id === mealId);
      if (isSelected) {
        return prev.filter(meal => meal.id !== mealId);
      } else {
        const mealToAdd = SAMPLE_MEALS.find(meal => meal.id === mealId);
        return mealToAdd ? [...prev, mealToAdd] : prev;
      }
    });
  };

  const handleGenerateMealPlan = async () => {
    if (selectedMeals.length === 0) {
      setToastVisible(true);
      setToastMessage('Please select at least one meal for your plan');
      setToastType('error');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Add all selected meals to the meal plan
      let successCount = 0;
      let failCount = 0;
      
      for (const meal of selectedMeals) {
        try {
          const result = await MealPlanService.addMealToPlan({
            id: meal.id,
            name: meal.name,
            description: meal.description,
            image: meal.image,
            tags: meal.tags,
            calories: meal.calories,
            price: meal.price,
            restaurant: meal.restaurant
          }, meal.type as 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks');
          
          if (result.success) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (error) {
          failCount++;
          console.error(`Error adding ${meal.name} to plan:`, error);
        }
      }
      
      // Store meal plan preferences
      const mealPlanData = {
        mealGoal,
        planDuration,
        restrictions,
        disliked,
        selectedMeals: selectedMeals.map(m => m.id),
        createdAt: new Date().toISOString()
      };
      
      await AsyncStorage.setItem('mealPlanPreferences', JSON.stringify(mealPlanData));
      
      // Get stored user email from signup
      const userEmail = await AsyncStorage.getItem('userEmail') || 'user@email.com';
      
      // Mark user as logged in and store user type
      await AsyncStorage.setItem('userType', 'customer');
      auth.setIsLoggedIn(true);
      
      // Set a basic user object
      auth.setUser({
        id: 'temp-user-id',
        email: userEmail,
        role: 'customer',
        isEmailVerified: false
      });
      
      // Set 15-minute grace period for unverified users
      const gracePeriodEnd = Date.now() + (15 * 60 * 1000); // 15 minutes from now
      auth.setVerificationGracePeriod(gracePeriodEnd);
      await AsyncStorage.setItem('verificationGracePeriod', gracePeriodEnd.toString());
      
      // Show success message
      const message = successCount > 0 ? 
        `Meal plan created! ${successCount} meals added successfully${failCount > 0 ? ` (${failCount} failed)` : ''}.` :
        'Meal plan created but no meals were added. You can add meals later from the menu.';
      
      Alert.alert(
        'Meal Plan Created!',
        message,
        [
          { text: 'Continue', onPress: () => router.replace('/(customer-tabs)/home') }
        ]
      );
      
    } catch (error: any) {
      console.error(' Error generating meal plan:', error);
      setToastVisible(true);
      setToastMessage('Failed to create meal plan. Please try again.');
      setToastType('error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.lightGray, marginTop: 60 }}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 20, 
        marginBottom: 18 
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
          <Ionicons name="chevron-back" size={24} color={colors.black} />
        </TouchableOpacity>
        <Text style={{ 
          fontWeight: 'bold', 
          fontSize: 18, 
          color: colors.black, 
          flex: 1, 
          textAlign: 'center' 
        }}>
          Build Your Meal Plan
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* Meal Goals */}
        <Text style={{ 
          fontWeight: 'bold', 
          fontSize: 12, 
          color: colors.darkGray, 
          marginBottom: 4 
        }}>
          MEAL GOALS
        </Text>
        <View style={{ 
          borderWidth: 1, 
          borderColor: colors.gray, 
          borderRadius: 8, 
          backgroundColor: colors.white, 
          marginBottom: 16 
        }}>
          <Picker
            selectedValue={mealGoal}
            onValueChange={setMealGoal}
            style={{ height: 55 }}
          >
            {MEAL_GOALS.map((goal) => (
              <Picker.Item key={goal} label={goal} value={goal} />
            ))}
          </Picker>
        </View>

        {/* Plan Duration */}
        <Text style={{ 
          fontWeight: 'bold', 
          fontSize: 12, 
          color: colors.darkGray, 
          marginBottom: 4 
        }}>
          PLAN DURATION
        </Text>
        <View style={{ 
          borderWidth: 1, 
          borderColor: colors.gray, 
          borderRadius: 8, 
          backgroundColor: colors.white, 
          marginBottom: 16 
        }}>
          <Picker
            selectedValue={planDuration}
            onValueChange={setPlanDuration}
            style={{ height: 55 }}
          >
            {PLAN_DURATIONS.map((duration) => (
              <Picker.Item key={duration} label={duration} value={duration} />
            ))}
          </Picker>
        </View>

        {/* Dietary Restrictions */}
        <Text style={{ 
          fontWeight: 'bold', 
          fontSize: 16, 
          color: colors.black, 
          marginBottom: 6 
        }}>
          Any specific meal preferences?
        </Text>
        <Text style={{ 
          fontWeight: 'bold', 
          fontSize: 13, 
          color: colors.darkGray, 
          marginBottom: 8 
        }}>
          Dietary Restrictions
        </Text>
        
        <View style={{ marginBottom: 16 }}>
          {DIETARY_RESTRICTIONS.map((item) => (
            <TouchableOpacity
              key={item}
              style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                marginBottom: 8,
                paddingVertical: 4
              }}
              onPress={() => handleRestrictionToggle(item)}
            >
              <View style={{
                width: 20,
                height: 20,
                borderWidth: 2,
                borderColor: colors.primary,
                borderRadius: 4,
                marginRight: 12,
                backgroundColor: restrictions.includes(item) ? colors.primary : colors.white,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {restrictions.includes(item) && (
                  <Ionicons name="checkmark" size={14} color={colors.white} />
                )}
              </View>
              <Text style={{ 
                fontSize: 15, 
                color: colors.black,
                fontWeight: restrictions.includes(item) ? '600' : '400'
              }}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Foods to Avoid */}
        <Text style={{ 
          fontWeight: 'bold', 
          fontSize: 13, 
          color: colors.darkGray, 
          marginBottom: 4 
        }}>
          FOODS TO AVOID (OPTIONAL)
        </Text>
        <TextInput
          placeholder="E.g., nuts, shellfish, spicy foods..."
          value={disliked}
          onChangeText={setDisliked}
          style={{ marginBottom: 20 }}
        />

        {/* Sample Meals Selection */}
        <Text style={{ 
          fontWeight: 'bold', 
          fontSize: 16, 
          color: colors.black, 
          marginBottom: 8 
        }}>
          Choose Your Starter Meals
        </Text>
        <Text style={{ 
          fontSize: 14, 
          color: colors.darkGray, 
          marginBottom: 12 
        }}>
          Select meals to include in your plan (you can add more later)
        </Text>

        <View style={{ marginBottom: 24 }}>
          {SAMPLE_MEALS.map((meal) => {
            const isSelected = selectedMeals.some(selected => selected.id === meal.id);
            return (
              <TouchableOpacity
                key={meal.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: colors.white,
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 12,
                  borderWidth: 2,
                  borderColor: isSelected ? colors.primary : colors.lightGray,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2
                }}
                onPress={() => handleMealToggle(meal.id)}
              >
                <Image 
                  source={meal.image} 
                  style={{ width: 60, height: 60, borderRadius: 8, marginRight: 12 }} 
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ 
                    fontSize: 16, 
                    fontWeight: '600', 
                    color: colors.black,
                    marginBottom: 4
                  }}>
                    {meal.name}
                  </Text>
                  <Text style={{ 
                    fontSize: 12, 
                    color: colors.darkGray,
                    marginBottom: 4
                  }}>
                    {meal.type}  {meal.calories}
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                    {meal.tags.slice(0, 2).map((tag, index) => (
                      <View key={index} style={{
                        backgroundColor: colors.primary,
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 8
                      }}>
                        <Text style={{ 
                          color: colors.white, 
                          fontSize: 10, 
                          fontWeight: '500' 
                        }}>
                          {tag}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
                <View style={{
                  width: 24,
                  height: 24,
                  borderWidth: 2,
                  borderColor: colors.primary,
                  borderRadius: 12,
                  backgroundColor: isSelected ? colors.primary : colors.white,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {isSelected && (
                    <Ionicons name="checkmark" size={16} color={colors.white} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Generate Button */}
        <Button
          title={isGenerating ? 'Creating Your Plan...' : 'Create My Meal Plan'}
          variant="primary"
          onPress={handleGenerateMealPlan}
          disabled={isGenerating}
          style={{ 
            marginTop: 8,
            paddingVertical: 16
          }}
        />

        <Text style={{ 
          fontSize: 12, 
          color: colors.darkGray, 
          textAlign: 'center', 
          marginTop: 12,
          lineHeight: 16
        }}>
          Your meal plan will be saved and you can modify it anytime from your profile
        </Text>
      </ScrollView>
      
      {/* Toast Component */}
      <MealPlanToast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />
    </SafeAreaView>
  );
}
