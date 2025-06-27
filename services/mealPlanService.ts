import AsyncStorage from '@react-native-async-storage/async-storage';

export interface MealPlanMeal {
  id: string;
  name: string;
  description: string;
  image: any;
  tags: string[];
  calories: string;
  price: number;
  category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
  restaurant?: string;
  addedAt: string;
}

class MealPlanService {
  private static readonly MEAL_PLAN_MEALS_KEY = 'mealPlanMeals';

  static async addMealToPlan(meal: {
    id: string;
    name: string;
    description: string;
    image: any;
    tags: string[];
    calories: string;
    price: number;
    restaurant?: string;
  }, category?: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks'): Promise<{ success: boolean; message: string }> {
    try {
      const existingMealsData = await AsyncStorage.getItem(this.MEAL_PLAN_MEALS_KEY);
      let existingMeals: MealPlanMeal[] = existingMealsData ? JSON.parse(existingMealsData) : [];

      const mealExists = existingMeals.some(planMeal => planMeal.id === meal.id);
      if (mealExists) {
        return {
          success: false,
          message: 'This meal is already in your meal plan!'
        };
      }

      let mealCategory: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks' = category || 'Lunch';
      
      if (!category) {
        const name = meal.name.toLowerCase();
        const tags = meal.tags.map(tag => tag.toLowerCase());
        
        if (name.includes('breakfast') || tags.some(tag => tag.includes('breakfast'))) {
          mealCategory = 'Breakfast';
        } else if (name.includes('dinner') || tags.some(tag => tag.includes('dinner'))) {
          mealCategory = 'Dinner';
        } else if (name.includes('snack') || tags.some(tag => tag.includes('snack'))) {
          mealCategory = 'Snacks';
        }
      }

      const mealPlanMeal: MealPlanMeal = {
        ...meal,
        category: mealCategory,
        addedAt: new Date().toISOString()
      };

      const updatedMeals = [...existingMeals, mealPlanMeal];
      await AsyncStorage.setItem(this.MEAL_PLAN_MEALS_KEY, JSON.stringify(updatedMeals));

      return {
        success: true,
        message: `Added to ${mealCategory} in your meal plan!`
      };

    } catch (error) {
      console.error('Error adding meal to plan:', error);
      return {
        success: false,
        message: 'Failed to add meal to plan. Please try again.'
      };
    }
  }

  static async getMealPlanMeals(): Promise<MealPlanMeal[]> {
    try {
      const mealsData = await AsyncStorage.getItem(this.MEAL_PLAN_MEALS_KEY);
      return mealsData ? JSON.parse(mealsData) : [];
    } catch (error) {
      console.error('Error getting meal plan meals:', error);
      return [];
    }
  }
}

export default MealPlanService;