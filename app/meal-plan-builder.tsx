import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, TextInput as RNTextInput, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Button } from '../components/Button';
import { TextInput } from '../components/TextInput';
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

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
  const router = useRouter();

  const handleRestrictionToggle = (item: string) => {
    setRestrictions((prev) =>
      prev.includes(item) ? prev.filter((r) => r !== item) : [...prev, item]
    );
  };

  const handleGenerateMealPlan = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate API call to save meal plan preferences
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Store meal plan data in AsyncStorage or send to backend
      console.log('Meal plan generated:', {
        mealGoal,
        planDuration,
        restrictions,
        disliked,
        meals
      });
      
      // Navigate back to settings or show success message
      router.back();
      
    } catch (error) {
      console.error('Error generating meal plan:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.lightGray, marginTop: 60 }}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header with back button */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 18 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
          <Ionicons name="chevron-back" size={24} color={colors.black} />
        </TouchableOpacity>
        <Text style={{ fontWeight: 'bold', fontSize: 18, color: colors.black, flex: 1, textAlign: 'center', marginRight: 40 }}>
          Build your Meal Plan
        </Text>
      </View>

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
          title={isGenerating ? "Generating..." : "Generate Meal Plan"}
          variant="primary"
          onPress={handleGenerateMealPlan}
          disabled={isGenerating}
        />
      </ScrollView>
    </SafeAreaView>
  );
} 