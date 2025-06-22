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
  const [showDebug, setShowDebug] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [backendStatus, setBackendStatus] = useState<string>('Not tested');
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
        setMealGoal(mealPlanData.mealGoal);
        setPlanDuration(mealPlanData.planDuration);
        setRestrictions(mealPlanData.restrictions);
        setDisliked(mealPlanData.disliked);
        setMeals(mealPlanData.meals);
        setHasExistingProfile(true);
        console.log('✅ Loaded profile from local storage');
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
            setMealGoal(mappedGoal);
            
            // Convert dietary restrictions back to frontend format
            const formattedRestrictions = prefs.dietaryRestrictions.map(restriction => {
              const formatted = restriction.replace('-', ' ');
              return formatted.charAt(0).toUpperCase() + formatted.slice(1);
            });
            setRestrictions(formattedRestrictions);
            
            setHasExistingProfile(true);
            console.log('✅ Loaded profile from backend');
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

  const testBackendConnection = async () => {
    setBackendStatus('Testing...');
    try {
      const authToken = await AsyncStorage.getItem('auth_token');
      if (!authToken) {
        setBackendStatus('❌ No auth token');
        Alert.alert('Test Failed', 'No authentication token found. Please log in first.');
        return;
      }
      
      // Test with a simple profile fetch
      const response = await getUserProfile();
      if (response.success) {
        setBackendStatus('✅ Connected');
        Alert.alert('✅ Backend Connected', 'Successfully connected to the backend!');
      } else {
        setBackendStatus('⚠️ Connected but no profile');
        Alert.alert('⚠️ Connected', 'Backend is reachable but no profile found yet.');
      }
    } catch (error: any) {
      setBackendStatus('❌ Connection failed');
      Alert.alert('❌ Connection Failed', `Could not connect to backend: ${error.message}`);
    }
  };

  const handleGenerateMealPlan = async () => {
    setIsGenerating(true);
    let debugLog = '🚀 MEAL PLAN BUILDER DEBUG\n\n';
    
    try {
      // Prepare meal plan data
      const mealPlanData: MealPlanData = {
        mealGoal,
        planDuration,
        restrictions,
        disliked,
        meals
      };
      
      debugLog += '📋 MEAL PLAN DATA:\n';
      debugLog += `Goal: ${mealGoal}\n`;
      debugLog += `Duration: ${planDuration}\n`;
      debugLog += `Restrictions: ${restrictions.join(', ') || 'None'}\n`;
      debugLog += `Disliked: ${disliked || 'None'}\n`;
      debugLog += `Meals: ${meals.map(m => m.type).join(', ')}\n\n`;
      
      // Transform to backend format
      const dietaryPreferences = transformMealPlanToDietaryPreferences(mealPlanData);
      debugLog += '🔄 BACKEND FORMAT:\n';
      debugLog += `Health Goal: ${dietaryPreferences.healthGoal}\n`;
      debugLog += `Dietary Restrictions: ${dietaryPreferences.dietaryRestrictions.join(', ')}\n`;
      debugLog += `Preferred Tags: ${dietaryPreferences.preferredMealTags.join(', ')}\n\n`;
      
      // Store meal plan preferences locally FIRST
      await AsyncStorage.setItem('mealPlan', JSON.stringify(mealPlanData));
      await AsyncStorage.setItem('dietaryPreferences', JSON.stringify(dietaryPreferences));
      debugLog += '💾 SAVED TO LOCAL STORAGE\n\n';
      
      // Try to save to backend
      let backendSaved = false;
      const authToken = await AsyncStorage.getItem('auth_token');
      debugLog += `🔑 AUTH TOKEN: ${authToken ? 'Found' : 'Not found'}\n`;
      
      if (authToken) {
        debugLog += '📡 ATTEMPTING BACKEND SAVE...\n';
        
        const response = await saveDietaryPreferences(dietaryPreferences);
        
        if (response.success) {
          debugLog += '✅ BACKEND SUCCESS!\n';
          backendSaved = true;
          
          // Mark user profile as complete
          await AsyncStorage.setItem('hasUserProfile', 'true');
          debugLog += '🏠 USER PROFILE MARKED AS COMPLETE\n';
          
          // Store email verification status
          await AsyncStorage.setItem('isEmailVerified', 'true');
          debugLog += '📧 EMAIL VERIFICATION STATUS STORED\n';
          
          // Try to fetch personalized meals
          try {
            const mealsResponse = await getUserMeals();
            if (mealsResponse.success && mealsResponse.data) {
              debugLog += `🍽️ PERSONALIZED MEALS FETCHED: ${mealsResponse.data.length} meals\n`;
            }
          } catch (mealError) {
            debugLog += `⚠️ Could not fetch personalized meals: ${mealError}\n`;
          }
          
        } else {
          debugLog += '❌ BACKEND FAILED!\n';
          debugLog += `Error: ${response.message}\n`;
          
          // Handle specific errors
          if (response.message?.includes('session has expired') || response.message?.includes('401')) {
            debugLog += '🔐 SESSION EXPIRED - CONTINUING WITH LOCAL SAVE\n';
            // Don't fail the whole process, just continue locally
          }
        }
      } else {
        debugLog += '📱 NO AUTH TOKEN - CONTINUING WITH LOCAL SAVE\n';
      }
      
      // ALWAYS mark profile as complete locally regardless of backend success
      await AsyncStorage.setItem('hasUserProfile', 'true');
      debugLog += '🏠 LOCAL PROFILE MARKED AS COMPLETE\n';
      
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
      
      debugLog += '🔐 USER LOGGED IN\n';
      debugLog += `✅ MEAL PLAN GENERATION COMPLETE!\n`;
      debugLog += `Backend Saved: ${backendSaved ? 'Yes' : 'No (Local only)'}\n`;
      
      setDebugInfo(debugLog);
      
      // Show success and navigate
      Alert.alert(
        hasExistingProfile ? 'Profile Updated!' : 'Meal Plan Created!',
        `${backendSaved ? '✅ Saved to backend successfully' : '📱 Saved locally (will sync when connected)'}\n\n${hasExistingProfile ? 'Your dietary preferences have been updated.' : 'Your meal plan has been created.'}`,
        [
          { text: 'View Debug', onPress: () => setShowDebug(true) },
          { 
            text: 'Continue to Home', 
            onPress: () => router.replace('/(customer-tabs)/home'),
            style: 'default'
          }
        ]
      );
      
    } catch (error: any) {
      debugLog += `❌ FATAL ERROR: ${error.message}\n`;
      setDebugInfo(debugLog);
      
      console.error('❌ Error generating meal plan:', error);
      
      // Still try to save locally and continue
      try {
        await AsyncStorage.setItem('hasUserProfile', 'true');
        await AsyncStorage.setItem('userType', 'customer');
        auth.setIsLoggedIn(true);
        
        Alert.alert(
          'Meal Plan Saved Locally', 
          'There was an issue connecting to the server, but your meal plan has been saved locally. You can continue to use the app.',
          [
            { text: 'View Debug', onPress: () => setShowDebug(true) },
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
        <TouchableOpacity onPress={() => setShowDebug(!showDebug)} style={{ marginLeft: 8 }}>
          <Ionicons name={showDebug ? "close" : "bug"} size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Profile Status Banner */}
      {hasExistingProfile && (
        <View style={{ backgroundColor: colors.primary, margin: 20, padding: 16, borderRadius: 8, marginBottom: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="checkmark-circle" size={20} color={colors.white} style={{ marginRight: 8 }} />
            <Text style={{ color: colors.white, fontWeight: 'bold', fontSize: 16 }}>Existing Profile Found</Text>
          </View>
          <Text style={{ color: '#B5C4B1', fontSize: 14, marginTop: 4 }}>
            Your preferences have been loaded. Make any changes and save to update.
          </Text>
        </View>
      )}

      {/* Debug Panel */}
      {showDebug && (
        <View style={{ backgroundColor: colors.black, margin: 20, padding: 16, borderRadius: 8, marginBottom: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ color: colors.white, fontWeight: 'bold', fontSize: 16 }}>🐛 Debug Panel</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity 
                onPress={testBackendConnection}
                style={{ backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4 }}>
                <Text style={{ color: colors.white, fontSize: 12, fontWeight: 'bold' }}>Test Backend</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <Text style={{ color: '#00ff00', fontSize: 12, marginBottom: 8 }}>
            Backend Status: {backendStatus}
          </Text>
          
          <ScrollView style={{ maxHeight: 200 }}>
            <Text style={{ color: '#00ff00', fontSize: 10, fontFamily: 'monospace' }}>
              {debugInfo || 'No debug info yet. Generate meal plan to see data flow.'}
            </Text>
          </ScrollView>
        </View>
      )}

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* Meal Goals */}
        <Text style={{ fontWeight: 'bold', fontSize: 12, color: colors.darkGray, marginBottom: 4 }}>MEAL GOALS</Text>
        <View style={{ borderWidth: 1, borderColor: colors.gray, borderRadius: 8, backgroundColor: colors.white, marginBottom: 16 }}>
          <Picker
            selectedValue={mealGoal}
            onValueChange={setMealGoal}
            style={{ height: 55 }}>
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
            style={{ height: 55 }}>
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
          style={{ marginBottom: 18 }}
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
        
        {/* Backend Connection Status */}
        <View style={{ marginTop: 12, padding: 12, backgroundColor: backendStatus.includes('✅') ? '#E8F5E8' : backendStatus.includes('❌') ? '#FFE8E8' : '#F0F0F0', borderRadius: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons 
              name={backendStatus.includes('✅') ? "checkmark-circle" : backendStatus.includes('❌') ? "alert-circle" : "cloud"} 
              size={16} 
              color={backendStatus.includes('✅') ? '#4CAF50' : backendStatus.includes('❌') ? '#F44336' : colors.darkGray} 
              style={{ marginRight: 8 }} 
            />
            <Text style={{ 
              color: backendStatus.includes('✅') ? '#4CAF50' : backendStatus.includes('❌') ? '#F44336' : colors.darkGray, 
              fontSize: 12,
              fontWeight: '500'
            }}>
              Backend: {backendStatus}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 