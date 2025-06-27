import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, TextInput as RNTextInput, Image, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Button } from '../components/Button';
import { TextInput } from '../components/TextInput';
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../auth-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveDietaryPreferences, getUserProfile, getUserMeals, transformMealPlanToDietaryPreferences, MealPlanData, DietaryPreferences } from '../services/api';

const MEAL_GOALS = [
  'Balanced nutrition',
  'Manage diabetes',
  'Weight loss',
  'Plant-based',
];
const PLAN_DURATIONS = ['3 days', '5 days', '10 days', '15 days'];
const DIETARY_RESTRICTIONS = [
  'Vegetarian',
  'Dairy-free',
  'Sugar free',
  'Low-carb',
  'Vegan',
  'Gluten-free',
];

const DEFAULT_MEALS = [
  {
    type: 'Breakfast',
    name: 'Avocado toast & eggs',
    image: require('../assets/breakfast.png'),
  },
  {
    type: 'Lunch',
    name: 'Jollof Quinoa with grilled chicken',
    image: require('../assets/lunch.png'),
  },
  {
    type: 'Dinner',
    name: 'Beans & Plantain',
    image: require('../assets/dinner.png'),
  },
];

export default function MealPlanBuilderScreen() {
  const [mealGoal, setMealGoal] = useState(MEAL_GOALS[0]);
  const [planDuration, setPlanDuration] = useState(PLAN_DURATIONS[0]);
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [disliked, setDisliked] = useState('');
  const [meals, setMeals] = useState(DEFAULT_MEALS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasExistingProfile, setHasExistingProfile] = useState(false);
  const router = useRouter();
  const auth = useAuth();

  // Load existing profile on component mount - but don't block UI
  useEffect(() => {
    loadExistingProfile();
  }, []);

  const loadExistingProfile = async () => {
    try {
      console.log('🔍 Quietly checking for existing profile...');
      
      // First check if we have local data
      const localMealPlan = await AsyncStorage.getItem('mealPlan');
      
      if (localMealPlan) {
        const mealPlanData: MealPlanData = JSON.parse(localMealPlan);
        // Check if mealPlanData is valid (all required fields are present and not empty)
        const isValid = mealPlanData && mealPlanData.mealGoal && mealPlanData.planDuration && Array.isArray(mealPlanData.meals) && mealPlanData.meals.length > 0;
        if (isValid) {
          setMealGoal(mealPlanData.mealGoal);
          setPlanDuration(mealPlanData.planDuration);
          setRestrictions(mealPlanData.restrictions);
          setDisliked(mealPlanData.disliked);
          setMeals(mealPlanData.meals);
          setHasExistingProfile(true);
          console.log('✅ Loaded profile from local storage');
        }
      }
      
      // Try to fetch from backend if user is authenticated - but don't block UI
      const authToken = await AsyncStorage.getItem('auth_token');
      if (authToken) {
        try {
          const profileResponse = await getUserProfile();
          if (profileResponse.success && profileResponse.data) {
            // Convert backend format back to frontend format
            const prefs = profileResponse.data;
            
            // Reverse mapping for health goals
            const goalMapping: { [key: string]: string } = {
              'balanced_nutrition': 'Balanced nutrition',
              'manage_diabetes': 'Manage diabetes', 
              'weight_loss': 'Weight loss',
              'plant_based': 'Plant-based',
            };
            
            const mappedGoal = goalMapping[prefs.healthGoal] || 'Balanced nutrition';
            // Convert dietary restrictions back to frontend format
            const formattedRestrictions = prefs.dietaryRestrictions.map(restriction => {
              const formatted = restriction.replace('-', ' ');
              return formatted.charAt(0).toUpperCase() + formatted.slice(1);
            });
            // Only set as existing if backend profile is valid
            const isBackendValid = prefs.healthGoal && Array.isArray(prefs.dietaryRestrictions);
            if (isBackendValid) {
              setMealGoal(mappedGoal);
              setRestrictions(formattedRestrictions);
              setHasExistingProfile(true);
              console.log('✅ Loaded profile from backend');
            }
          }
        } catch (error) {
          console.log('ℹ️ No existing backend profile found (this is okay)');
          // Don't show error to user - this is normal for new users
        }
      }
      
    } catch (error) {
      console.error('❌ Error loading existing profile:', error);
      // Don't show error to user - continue with default values
    }
  };

  const handleRestrictionToggle = (item: string) => {
    setRestrictions((prev) =>
      prev.includes(item) ? prev.filter((r) => r !== item) : [...prev, item]
    );
  };

  const handleGenerateMealPlan = async () => {
    setIsGenerating(true);
    try {
      // Prepare meal plan data
      const mealPlanData: MealPlanData = {
        mealGoal,
        planDuration,
        restrictions,
        disliked,
        meals
      };
      
      // Transform to backend format
      const dietaryPreferences = transformMealPlanToDietaryPreferences(mealPlanData);
      
      // Store meal plan preferences locally FIRST
      await AsyncStorage.setItem('mealPlan', JSON.stringify(mealPlanData));
      await AsyncStorage.setItem('dietaryPreferences', JSON.stringify(dietaryPreferences));
      
      // Try to save to backend
      let backendSaved = false;
      const authToken = await AsyncStorage.getItem('auth_token');
      if (authToken) {
        const response = await saveDietaryPreferences(dietaryPreferences);
        if (response.success) {
          backendSaved = true;
          // Mark user profile as complete
          await AsyncStorage.setItem('hasUserProfile', 'true');
          // Store email verification status
          await AsyncStorage.setItem('isEmailVerified', 'true');
          // Try to fetch personalized meals
          try {
            const mealsResponse = await getUserMeals();
            if (mealsResponse.success && mealsResponse.data) {
            }
          } catch (mealError) {
          }
        } else {
          // Handle specific errors
          if (response.message?.includes('session has expired') || response.message?.includes('401')) {
            // Don't fail the whole process, just continue locally
          }
        }
      }
      // ALWAYS mark profile as complete locally regardless of backend success
      await AsyncStorage.setItem('hasUserProfile', 'true');
      // Update auth state
      await AsyncStorage.setItem('userType', 'customer');
      auth.setIsLoggedIn(true);
      const userEmail = await AsyncStorage.getItem('userEmail') || 'user@email.com';
      auth.setUser({
        id: 'temp-user-id',
        email: userEmail,
        role: 'customer',
        isEmailVerified: true,
        hasProfile: true // Always true since we saved locally
      });
      // Show success and navigate
      Alert.alert(
        'Meal plan saved successfully',
        '',
        [
          { 
            text: 'Continue to Home', 
            onPress: () => router.replace('/(customer-tabs)/home'),
            style: 'default'
          }
        ]
      );
    } catch (error: any) {
      console.error('❌ Error generating meal plan:', error);
      // Still try to save locally and continue
      try {
        await AsyncStorage.setItem('hasUserProfile', 'true');
        await AsyncStorage.setItem('userType', 'customer');
        auth.setIsLoggedIn(true);
        Alert.alert(
          'Meal plan saved successfully',
          '',
          [
            { 
              text: 'Continue to Home', 
              onPress: () => router.replace('/(customer-tabs)/home')
            }
          ]
        );
      } catch (localError) {
        Alert.alert('Error', 'Unable to save meal plan. Please try again.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.lightGray, marginTop: 60 }}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header with back button */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 18 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 18, color: colors.black, flex: 1, textAlign: 'center' }}>
          {hasExistingProfile ? 'Update Your Meal Plan' : 'Build your Meal Plan'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* Meal Goals */}
        <Text style={{ fontWeight: 'bold', fontSize: 12, color: colors.darkGray, marginBottom: 4 }}>MEAL GOALS</Text>
        <View style={{ borderWidth: 1, borderColor: colors.gray, borderRadius: 8, backgroundColor: colors.white, marginBottom: 16 }}>
          <Picker
            selectedValue={mealGoal}
            onValueChange={setMealGoal}
            style={{ height: 55, color: colors.primary }}>
            {MEAL_GOALS.map((goal) => (
              <Picker.Item key={goal} label={goal} value={goal} />
            ))}
          </Picker>
        </View>
        {/* Plan Duration */}
        <Text style={{ fontWeight: 'bold', fontSize: 12, color: colors.darkGray, marginBottom: 4 }}>PLAN DURATION</Text>
        <View style={{ borderWidth: 1, borderColor: colors.gray, borderRadius: 8, backgroundColor: colors.white, marginBottom: 16 }}>
          <Picker
            selectedValue={planDuration}
            onValueChange={setPlanDuration}
            style={{ height: 55, color: colors.primary }}>
            {PLAN_DURATIONS.map((d) => (
              <Picker.Item key={d} label={d} value={d} />
            ))}
          </Picker>
        </View>
        {/* Dietary Restrictions */}
        <Text style={{ fontWeight: 'bold', fontSize: 16, color: colors.black, marginBottom: 6 }}>Any specific meal preferences?</Text>
        <Text style={{ fontWeight: 'bold', fontSize: 13, color: colors.darkGray, marginBottom: 4 }}>Dietary Restrictions</Text>
        <View style={{ marginBottom: 12 }}>
          {DIETARY_RESTRICTIONS.map((item) => (
            <TouchableOpacity
              key={item}
              style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}
              onPress={() => handleRestrictionToggle(item)}>
              <View style={{
                width: 18,
                height: 18,
                borderWidth: 1.5,
                borderColor: colors.primary,
                borderRadius: 4,
                marginRight: 8,
                backgroundColor: restrictions.includes(item) ? colors.primary : colors.white,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {restrictions.includes(item) && (
                  <Ionicons name="checkmark" size={12} color={colors.white} />
                )}
              </View>
              <Text style={{ color: colors.darkGray, fontSize: 14 }}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* Disliked Ingredients */}
        <Text style={{ fontWeight: 'bold', fontSize: 13, color: colors.darkGray, marginBottom: 4 }}>Disliked Ingredients</Text>
        <TextInput
          placeholder="E.g. mushrooms, onions"
          value={disliked}
          onChangeText={setDisliked}
          style={{ marginBottom: 18, color: colors.primary }}
        />
        {/* Customize Daily Meals */}
        <Text style={{ fontWeight: 'bold', fontSize: 16, color: colors.black, marginBottom: 8 }}>
          Customize Your Daily Meals
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 4, gap: 12, paddingBottom: 8 }}
          style={{ marginBottom: 18 }}
        >
          {meals.map((meal, idx) => (
            <View
              key={meal.type}
              style={{
                alignItems: 'center',
                minWidth: 120,
                marginHorizontal: 2,
                position: 'relative',
              }}
            >
              {/* Overlapping meal image */}
              <View style={{ zIndex: 2, position: 'absolute' }}>
                <Image
                  source={meal.image}
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: 50,
                    borderColor: colors.lightGray, // Optional: adds a border for separation
                  }}
                  resizeMode="cover"
                />
              </View>
              {/* Card */}
              <View
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 18,
                  paddingTop: 28, // Leaves space for image overlap
                  paddingBottom: 12,
                  paddingHorizontal: 10,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.10,
                  shadowRadius: 6,
                  elevation: 2,
                  minWidth: 120,
                  height: 140, // More compact
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  marginTop: 50, // Push card down so image overlaps
                  overflow: 'visible',
                }}
              >
                {/* Meal type */}
                <Text
                  style={{
                    fontWeight: 'bold',
                    color: colors.white,
                    fontSize: 15,
                    marginBottom: 2,
                    textAlign: 'center',
                    letterSpacing: 0.1,
                  }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {meal.type}
                </Text>
                {/* Meal name */}
                <Text
                  style={{
                    color: '#B5C4B1',
                    fontSize: 11,
                    textAlign: 'center',
                    marginBottom: 8,
                    fontWeight: '500',
                    lineHeight: 14,
                    maxWidth: 110,
                  }}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {meal.name}
                </Text>
                {/* Edit button */}
                <TouchableOpacity
                  style={{
                    backgroundColor: colors.white,
                    borderRadius: 12,
                    paddingVertical: 2,
                    paddingHorizontal: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 22,
                    minWidth: 40,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.06,
                    shadowRadius: 1,
                    elevation: 1,
                  }}
                  onPress={() => {}}
                  activeOpacity={0.85}
                >
                  <Text
                    style={{
                      color: colors.primary,
                      fontWeight: '600',
                      fontSize: 12,
                      textAlign: 'center',
                    }}
                  >
                    Edit
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
        {/* Review Your Plan */}
        <Text style={{ fontWeight: 'bold', fontSize: 16, color: colors.black, marginBottom: 8 }}>Review Your Plan</Text>
        <View style={{ backgroundColor: colors.white, borderRadius: 12, padding: 12, marginBottom: 10 }}>
          <Text style={{ fontWeight: 'bold', color: colors.darkGray, fontSize: 13 }}>Meal Goal</Text>
          <Text style={{ color: colors.black, fontSize: 14 }}>{mealGoal}</Text>
        </View>
        <View style={{ backgroundColor: colors.white, borderRadius: 12, padding: 12, marginBottom: 10 }}>
          <Text style={{ fontWeight: 'bold', color: colors.darkGray, fontSize: 13 }}>Duration</Text>
          <Text style={{ color: colors.black, fontSize: 14 }}>{planDuration}</Text>
        </View>
        <View style={{ backgroundColor: colors.white, borderRadius: 12, padding: 12, marginBottom: 10 }}>
          <Text style={{ fontWeight: 'bold', color: colors.darkGray, fontSize: 13 }}>Meal Preference</Text>
          <Text style={{ color: colors.black, fontSize: 14 }}>{restrictions.join(', ') || '-'}</Text>
        </View>
        <View style={{ backgroundColor: colors.white, borderRadius: 12, padding: 12, marginBottom: 18 }}>
          <Text style={{ fontWeight: 'bold', color: colors.darkGray, fontSize: 13 }}>Selected Meals</Text>
          {meals.map((meal) => (
            <Text key={meal.type} style={{ color: colors.black, fontSize: 14 }}>
              <Text style={{ fontWeight: 'bold' }}>{meal.type}</Text> — {meal.name}
            </Text>
          ))}
        </View>
        <Button
          title={isGenerating ? "Saving..." : hasExistingProfile ? "Update Profile" : "Generate Meal Plan"}
          variant="primary"
          onPress={handleGenerateMealPlan}
          disabled={isGenerating}
        />
        
        {/* Additional Info */}
        <View style={{ marginTop: 16, padding: 16, backgroundColor: colors.white, borderRadius: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Ionicons name="information-circle" size={20} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={{ fontWeight: 'bold', color: colors.black, fontSize: 16 }}>What happens next?</Text>
          </View>
          <Text style={{ color: colors.darkGray, fontSize: 14, lineHeight: 20 }}>
            {hasExistingProfile ? 
              "Your preferences will be updated and saved to your profile. You'll see personalized meal recommendations on your home screen." :
              "We'll create your personalized meal plan and save your preferences. You'll then be taken to your home screen where you can explore meals tailored to your dietary needs."
            }
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 