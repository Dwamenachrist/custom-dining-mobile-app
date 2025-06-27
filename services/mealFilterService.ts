import AsyncStorage from '@react-native-async-storage/async-storage';
import { DietaryPreferences, Meal as BackendMeal } from './api';

export interface FilteredMeal {
  id: string;
  name: string;
  description: string;
  image: any;
  tags: string[];
  calories: string;
  rating: number;
  price: number;
  restaurant?: string;
  dietaryTags: string[];
  category: string; // breakfast, lunch, dinner, snacks
}

export class MealFilterService {
  private static dietaryPrefs: DietaryPreferences | null = null;

  // Load user's dietary preferences
  static async loadDietaryPreferences(): Promise<DietaryPreferences | null> {
    try {
      const storedPrefs = await AsyncStorage.getItem('dietaryPreferences');
      if (storedPrefs) {
        this.dietaryPrefs = JSON.parse(storedPrefs);
        console.log('🍎 Loaded dietary preferences for filtering:', this.dietaryPrefs);
        return this.dietaryPrefs;
      }
      return null;
    } catch (error) {
      console.error('❌ Error loading dietary preferences:', error);
      return null;
    }
  }

  // Check if a meal matches user's dietary preferences
  static matchesDietaryPreferences(meal: BackendMeal, preferences: DietaryPreferences): boolean {
    if (!preferences) return true;

    const mealTags = meal.dietaryTags.map(tag => tag.toLowerCase());
    
    // Check dietary restrictions (user's restrictions should be present in meal)
    const matchesRestrictions = preferences.dietaryRestrictions.length === 0 || 
      preferences.dietaryRestrictions.some(restriction => 
        mealTags.some(tag => 
          tag.includes(restriction.toLowerCase()) ||
          restriction.toLowerCase().includes(tag)
        )
      );

    // Check preferred meal tags (user's preferences should be present in meal)
    const matchesPreferredTags = preferences.preferredMealTags.length === 0 ||
      preferences.preferredMealTags.some(preferred => 
        mealTags.some(tag => 
          tag.includes(preferred.toLowerCase()) ||
          preferred.toLowerCase().includes(tag)
        )
      );

    // Check health goal alignment
    const matchesHealthGoal = this.checkHealthGoalAlignment(meal, preferences.healthGoal);

    return matchesRestrictions && (matchesPreferredTags || matchesHealthGoal);
  }

  // Check if meal aligns with health goal
  private static checkHealthGoalAlignment(meal: BackendMeal, healthGoal: string): boolean {
    const mealTags = meal.dietaryTags.map(tag => tag.toLowerCase());
    const calories = meal.nutritionalInfo?.calories || 0;

    switch (healthGoal) {
      case 'weight_loss':
        return mealTags.some(tag => 
          tag.includes('low-carb') || 
          tag.includes('low-calorie') || 
          tag.includes('sugar-free')
        ) || calories < 400;
      
      case 'muscle_gain':
        return mealTags.some(tag => 
          tag.includes('high-protein') || 
          tag.includes('protein-rich')
        ) || (meal.nutritionalInfo?.protein || 0) > 20;
      
      case 'balanced_nutrition':
        return true; // All meals can contribute to balanced nutrition
      
      default:
        return true;
    }
  }

  // Filter meals by category (breakfast, lunch, dinner, snacks)
  static filterByCategory(meals: BackendMeal[], category: string): BackendMeal[] {
    const categoryKeywords = {
      breakfast: ['breakfast', 'oats', 'pancakes', 'toast', 'moi moi', 'akamu', 'cereal'],
      lunch: ['lunch', 'rice', 'pasta', 'salad', 'soup', 'sandwich', 'jollof'],
      dinner: ['dinner', 'grilled', 'stew', 'curry', 'fish', 'chicken', 'beef'],
      snacks: ['snack', 'fruit', 'nuts', 'smoothie', 'chips', 'crackers']
    };

    const keywords = categoryKeywords[category.toLowerCase() as keyof typeof categoryKeywords] || [];
    
    return meals.filter(meal => {
      const nameWords = meal.name.toLowerCase().split(' ');
      const descWords = meal.description.toLowerCase().split(' ');
      const tags = meal.dietaryTags.map(tag => tag.toLowerCase());
      
      return keywords.some(keyword => 
        nameWords.some(word => word.includes(keyword)) ||
        descWords.some(word => word.includes(keyword)) ||
        tags.some(tag => tag.includes(keyword))
      );
    });
  }

  // Convert backend meal to display format
  static convertToDisplayFormat(meal: BackendMeal, category: string): FilteredMeal {
    return {
      id: meal.id,
      name: meal.name,
      description: meal.description,
      image: meal.image || require('../assets/recommendation1.png'),
      tags: meal.dietaryTags.slice(0, 2), // Show first 2 tags
      calories: meal.nutritionalInfo?.calories ? 
        `${meal.nutritionalInfo.calories} Cal Per Serving` : 
        '310 Cal Per Serving',
      rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5-5.0
      price: parseFloat(meal.price) || 3000,
      restaurant: meal.restaurant?.name || 'Restaurant',
      dietaryTags: meal.dietaryTags,
      category: category
    };
  }

  // Main filtering function for category screens
  static async filterMealsForCategory(
    meals: BackendMeal[], 
    category: string,
    applyDietaryFilter: boolean = true
  ): Promise<FilteredMeal[]> {
    try {
      // Step 1: Filter by category
      const categoryMeals = this.filterByCategory(meals, category);
      console.log(`🍽️ Found ${categoryMeals.length} ${category} meals`);

      // Step 2: Apply dietary preferences filter if enabled
      let filteredMeals = categoryMeals;
      if (applyDietaryFilter) {
        const preferences = await this.loadDietaryPreferences();
        if (preferences) {
          filteredMeals = categoryMeals.filter(meal => 
            this.matchesDietaryPreferences(meal, preferences)
          );
          console.log(`🎯 Filtered to ${filteredMeals.length} meals based on dietary preferences`);
        }
      }

      // Step 3: Convert to display format
      const displayMeals = filteredMeals.map(meal => 
        this.convertToDisplayFormat(meal, category)
      );

      return displayMeals;
    } catch (error) {
      console.error('❌ Error filtering meals for category:', error);
      return [];
    }
  }

  // Filter restaurants based on their available meals matching dietary preferences
  static async filterRestaurantsByMeals(
    restaurants: any[], 
    allMeals: BackendMeal[]
  ): Promise<any[]> {
    try {
      const preferences = await this.loadDietaryPreferences();
      if (!preferences) return restaurants;

      const filteredRestaurants = restaurants.filter(restaurant => {
        // Get meals for this restaurant
        const restaurantMeals = allMeals.filter(meal => 
          meal.restaurantId === restaurant.restaurantId
        );

        // Check if restaurant has at least one meal matching preferences
        return restaurantMeals.some(meal => 
          this.matchesDietaryPreferences(meal, preferences)
        );
      });

      console.log(`🏪 Filtered ${restaurants.length} restaurants to ${filteredRestaurants.length} based on meal preferences`);
      return filteredRestaurants;
    } catch (error) {
      console.error('❌ Error filtering restaurants:', error);
      return restaurants;
    }
  }

  // Get personalization status
  static async getPersonalizationInfo(): Promise<{
    isPersonalized: boolean;
    preferences: DietaryPreferences | null;
    summary: string;
  }> {
    const preferences = await this.loadDietaryPreferences();
    
    if (!preferences) {
      return {
        isPersonalized: false,
        preferences: null,
        summary: 'Complete profile for personalized recommendations'
      };
    }

    const goalText = preferences.healthGoal.replace('_', ' ');
    const restrictionsText = preferences.dietaryRestrictions.join(', ');
    const summary = `Personalized for ${goalText}${restrictionsText ? ' • ' + restrictionsText : ''}`;

    return {
      isPersonalized: true,
      preferences,
      summary
    };
  }
}

export default MealFilterService; 