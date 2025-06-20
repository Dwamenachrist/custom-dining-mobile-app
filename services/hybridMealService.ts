import { getAllMeals, Meal as BackendMeal } from './api';

// Restaurant mapping with real images
const RESTAURANTS = {
  'green-chef': {
    id: 'rest-green-chef',
    name: 'Green Chef Kitchen',
    location: 'Victoria Island, Lagos',
    cuisineType: 'Healthy Nigerian',
    image: require('../assets/restaurants/Green Chef Kitchen.png'),
    rating: 4.8,
    reviewCount: 342,
    deliveryTime: '20-25 min',
    priceRange: '₦₦₦'
  },
  'nutri-pot': {
    id: 'rest-nutri-pot',
    name: 'Nutri Pot',
    location: 'Lekki, Lagos',
    cuisineType: 'Nutritious Meals',
    image: require('../assets/restaurants/Nutri Pot.png'),
    rating: 4.6,
    reviewCount: 287,
    deliveryTime: '25-30 min',
    priceRange: '₦₦'
  },
  'nok-alara': {
    id: 'rest-nok-alara',
    name: 'NOK By Alara',
    location: 'Ikoyi, Lagos',
    cuisineType: 'Contemporary Nigerian',
    image: require('../assets/restaurants/NOK By Alara.png'),
    rating: 4.9,
    reviewCount: 456,
    deliveryTime: '30-35 min',
    priceRange: '₦₦₦₦'
  },
  'maubbys': {
    id: 'rest-maubbys',
    name: 'Maubbys Salad',
    location: 'Surulere, Lagos',
    cuisineType: 'Fresh Salads & Healthy',
    image: require('../assets/restaurants/Maubbys Salad.png'),
    rating: 4.7,
    reviewCount: 198,
    deliveryTime: '15-20 min',
    priceRange: '₦₦'
  },
  'green-grill': {
    id: 'rest-green-grill',
    name: 'Green Grill Restaurant',
    location: 'Ikeja, Lagos',
    cuisineType: 'Grilled & Traditional',
    image: require('../assets/restaurants/Green Grill Resturant.png'),
    rating: 4.5,
    reviewCount: 234,
    deliveryTime: '25-35 min',
    priceRange: '₦₦₦'
  },
  'addys': {
    id: 'rest-addys',
    name: 'Addys Health Kitchen',
    location: 'Gbagada, Lagos',
    cuisineType: 'Health-Focused Nigerian',
    image: require('../assets/restaurants/Addys Health Kitchen.png'),
    rating: 4.4,
    reviewCount: 167,
    deliveryTime: '20-30 min',
    priceRange: '₦₦'
  },
  'so-fresh': {
    id: 'rest-so-fresh',
    name: 'So Fresh',
    location: 'Ajah, Lagos',
    cuisineType: 'Fresh & Organic',
    image: require('../assets/restaurants/So Fresh.png'),
    rating: 4.6,
    reviewCount: 298,
    deliveryTime: '25-35 min',
    priceRange: '₦₦₦'
  },
  'health-healthy': {
    id: 'rest-health-healthy',
    name: 'Health n Healthy',
    location: 'Yaba, Lagos',
    cuisineType: 'Wellness & Nutrition',
    image: require('../assets/restaurants/Health n Healthy.png'),
    rating: 4.3,
    reviewCount: 145,
    deliveryTime: '20-25 min',
    priceRange: '₦₦'
  }
};

// Comprehensive Nigerian meals matching your image names
const COMPREHENSIVE_MEALS: BackendMeal[] = [
  {
    id: 'meal-fruity-oats',
    name: 'Fruity Oats Delight',
    description: 'A nourishing bowl of rolled oats topped with fresh bananas, berries, and chia seeds. Served warm with almond milk. Perfect for starting your day right—no added sugar, just natural sweetness.',
    price: '5000.00',
    isAvailable: 1,
    restaurantId: 'rest-green-chef',
    dietaryTags: ['low-carb', 'sugar-free', 'high-fiber', 'vegan', 'breakfast', 'gluten-free'],
    allergens: ['nuts'],
    nutritionalInfo: { 
      calories: 310, 
      protein: 12, 
      carbs: 38, 
      fat: 8,
      sugars: 10,
      fiber: 12,
      sodium: 90
    },
    restaurant: RESTAURANTS['green-chef'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'meal-avocado-toast-egg',
    name: 'Avocado Toast and Egg',
    description: 'Artisanal whole grain bread topped with creamy mashed avocado, perfectly poached egg, and a sprinkle of everything seasoning. A protein-rich breakfast that keeps you energized.',
    price: '4500.00',
    isAvailable: 1,
    restaurantId: 'rest-so-fresh',
    dietaryTags: ['high-protein', 'healthy-fats', 'breakfast', 'vegetarian', 'low-carb'],
    allergens: ['gluten', 'eggs'],
    nutritionalInfo: { 
      calories: 380, 
      protein: 18, 
      carbs: 25, 
      fat: 24,
      sugars: 3,
      fiber: 12,
      sodium: 420
    },
    restaurant: RESTAURANTS['so-fresh'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'meal-avocado-veggie-bowl',
    name: 'Avocado Veggie Bowl',
    description: 'Fresh quinoa bowl loaded with avocado, roasted vegetables, cherry tomatoes, cucumber, and tahini dressing. A complete plant-based meal packed with nutrients.',
    price: '6500.00',
    isAvailable: 1,
    restaurantId: 'rest-maubbys',
    dietaryTags: ['vegan', 'gluten-free', 'high-fiber', 'low-sodium', 'superfood', 'plant-based'],
    allergens: ['sesame'],
    nutritionalInfo: { 
      calories: 420, 
      protein: 16, 
      carbs: 35, 
      fat: 26,
      sugars: 8,
      fiber: 18,
      sodium: 280
    },
    restaurant: RESTAURANTS['maubbys'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'meal-basmati-jollof',
    name: 'Basmati Jollof Rice',
    description: 'Premium basmati rice cooked in rich tomato and pepper sauce with Nigerian spices. Served with grilled chicken and plantain. A healthier take on the classic Nigerian favorite.',
    price: '8500.00',
    isAvailable: 1,
    restaurantId: 'rest-nok-alara',
    dietaryTags: ['gluten-free', 'high-protein', 'traditional', 'spicy', 'chicken'],
    allergens: [],
    nutritionalInfo: { 
      calories: 520, 
      protein: 28, 
      carbs: 65, 
      fat: 16,
      sugars: 12,
      fiber: 4,
      sodium: 680
    },
    restaurant: RESTAURANTS['nok-alara'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'meal-beans-potato',
    name: 'Beans and Potato',
    description: 'Hearty Nigerian beans porridge cooked with sweet potatoes, palm oil, and traditional spices. Rich in plant protein and fiber, perfect for sustained energy.',
    price: '4000.00',
    isAvailable: 1,
    restaurantId: 'rest-addys',
    dietaryTags: ['vegan', 'high-protein', 'high-fiber', 'traditional', 'gluten-free', 'diabetic-friendly'],
    allergens: [],
    nutritionalInfo: { 
      calories: 350, 
      protein: 18, 
      carbs: 55, 
      fat: 8,
      sugars: 6,
      fiber: 16,
      sodium: 420
    },
    restaurant: RESTAURANTS['addys'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'meal-fruity-pancakes',
    name: 'Fruity Pancakes',
    description: 'Fluffy whole wheat pancakes topped with fresh strawberries, blueberries, and a drizzle of pure honey. Made with almond flour for extra protein and served with Greek yogurt.',
    price: '5500.00',
    isAvailable: 1,
    restaurantId: 'rest-health-healthy',
    dietaryTags: ['breakfast', 'high-protein', 'whole-grain', 'antioxidants', 'vegetarian'],
    allergens: ['gluten', 'dairy', 'eggs', 'nuts'],
    nutritionalInfo: { 
      calories: 450, 
      protein: 22, 
      carbs: 58, 
      fat: 14,
      sugars: 28,
      fiber: 8,
      sodium: 380
    },
    restaurant: RESTAURANTS['health-healthy'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'meal-grilled-fish-veggies',
    name: 'Grilled Fish and Veggies',
    description: 'Fresh tilapia grilled to perfection with Nigerian spices, served with steamed broccoli, carrots, and green beans. A lean protein meal perfect for fitness enthusiasts.',
    price: '9500.00',
    isAvailable: 1,
    restaurantId: 'rest-green-grill',
    dietaryTags: ['high-protein', 'low-carb', 'keto-friendly', 'diabetic-friendly', 'omega-3', 'grilled'],
    allergens: ['fish'],
    nutritionalInfo: { 
      calories: 320, 
      protein: 42, 
      carbs: 12, 
      fat: 12,
      sugars: 8,
      fiber: 6,
      sodium: 520
    },
    restaurant: RESTAURANTS['green-grill'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'meal-moi-moi-akamu',
    name: 'Moi Moi and Akamu',
    description: 'Traditional steamed bean pudding made with black-eyed peas, peppers, and spices, served with smooth corn porridge (akamu). A classic Nigerian breakfast rich in plant protein.',
    price: '3500.00',
    isAvailable: 1,
    restaurantId: 'rest-nutri-pot',
    dietaryTags: ['vegan', 'gluten-free', 'high-protein', 'traditional', 'breakfast', 'high-fiber'],
    allergens: [],
    nutritionalInfo: { 
      calories: 280, 
      protein: 16, 
      carbs: 42, 
      fat: 6,
      sugars: 8,
      fiber: 12,
      sodium: 320
    },
    restaurant: RESTAURANTS['nutri-pot'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'meal-ofada-rice-sauce',
    name: 'Ofada Rice and Sauce',
    description: 'Aromatic local Nigerian rice served with spicy ofada sauce made with locust beans, palm oil, and assorted peppers. A traditional delicacy with authentic Nigerian flavors.',
    price: '7500.00',
    isAvailable: 1,
    restaurantId: 'rest-green-chef',
    dietaryTags: ['traditional', 'spicy', 'gluten-free', 'authentic', 'local-rice'],
    allergens: [],
    nutritionalInfo: { 
      calories: 480, 
      protein: 14, 
      carbs: 72, 
      fat: 16,
      sugars: 6,
      fiber: 4,
      sodium: 720
    },
    restaurant: RESTAURANTS['green-chef'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'meal-peanut-butter-toast',
    name: 'Peanut Butter Toast',
    description: 'Thick-cut whole grain bread topped with natural peanut butter, sliced bananas, and a sprinkle of chia seeds. A protein-packed breakfast that provides lasting energy.',
    price: '3000.00',
    isAvailable: 1,
    restaurantId: 'rest-so-fresh',
    dietaryTags: ['high-protein', 'breakfast', 'whole-grain', 'healthy-fats', 'vegetarian', 'energy-boosting'],
    allergens: ['gluten', 'nuts'],
    nutritionalInfo: { 
      calories: 420, 
      protein: 18, 
      carbs: 35, 
      fat: 24,
      sugars: 12,
      fiber: 8,
      sodium: 280
    },
    restaurant: RESTAURANTS['so-fresh'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'meal-plantain-egg-sauce',
    name: 'Plantain and Egg Sauce',
    description: 'Sweet fried plantain served with scrambled eggs cooked in tomato and pepper sauce. A beloved Nigerian comfort food that combines sweet and savory flavors perfectly.',
    price: '4500.00',
    isAvailable: 1,
    restaurantId: 'rest-addys',
    dietaryTags: ['gluten-free', 'high-protein', 'traditional', 'comfort-food', 'vegetarian'],
    allergens: ['eggs'],
    nutritionalInfo: { 
      calories: 380, 
      protein: 16, 
      carbs: 48, 
      fat: 16,
      sugars: 22,
      fiber: 4,
      sodium: 420
    },
    restaurant: RESTAURANTS['addys'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'meal-plantain-soup',
    name: 'Plantain and Soup',
    description: 'Unripe plantain cooked in rich Nigerian vegetable soup with spinach, meat, and traditional spices. A nutritious one-pot meal loaded with vitamins and minerals.',
    price: '6000.00',
    isAvailable: 1,
    restaurantId: 'rest-green-grill',
    dietaryTags: ['gluten-free', 'high-protein', 'traditional', 'vegetables', 'one-pot', 'nutrient-dense'],
    allergens: [],
    nutritionalInfo: { 
      calories: 420, 
      protein: 24, 
      carbs: 45, 
      fat: 18,
      sugars: 15,
      fiber: 8,
      sodium: 580
    },
    restaurant: RESTAURANTS['green-grill'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'meal-sauce-yam',
    name: 'Sauce and Yam',
    description: 'Boiled yam served with rich tomato and pepper sauce cooked with onions and Nigerian spices. A classic combination that\'s both filling and nutritious.',
    price: '5000.00',
    isAvailable: 1,
    restaurantId: 'rest-nutri-pot',
    dietaryTags: ['vegan', 'gluten-free', 'traditional', 'high-carb', 'energy-rich'],
    allergens: [],
    nutritionalInfo: { 
      calories: 450, 
      protein: 8, 
      carbs: 85, 
      fat: 8,
      sugars: 12,
      fiber: 6,
      sodium: 480
    },
    restaurant: RESTAURANTS['nutri-pot'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'meal-tofu-rice',
    name: 'Tofu Rice',
    description: 'Seasoned brown rice served with marinated grilled tofu, steamed vegetables, and teriyaki sauce. A plant-based protein powerhouse with Asian-Nigerian fusion flavors.',
    price: '7000.00',
    isAvailable: 1,
    restaurantId: 'rest-maubbys',
    dietaryTags: ['vegan', 'high-protein', 'plant-based', 'gluten-free', 'asian-fusion', 'low-sodium'],
    allergens: ['soy'],
    nutritionalInfo: { 
      calories: 390, 
      protein: 22, 
      carbs: 52, 
      fat: 12,
      sugars: 8,
      fiber: 8,
      sodium: 420
    },
    restaurant: RESTAURANTS['maubbys'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'meal-turkey-salad',
    name: 'Turkey and Salad',
    description: 'Lean grilled turkey breast served over mixed greens with cherry tomatoes, cucumber, red onions, and balsamic vinaigrette. A light yet satisfying meal perfect for weight management.',
    price: '8000.00',
    isAvailable: 1,
    restaurantId: 'rest-health-healthy',
    dietaryTags: ['high-protein', 'low-carb', 'keto-friendly', 'weight-loss', 'diabetic-friendly', 'lean-meat'],
    allergens: [],
    nutritionalInfo: { 
      calories: 280, 
      protein: 38, 
      carbs: 12, 
      fat: 8,
      sugars: 8,
      fiber: 6,
      sodium: 380
    },
    restaurant: RESTAURANTS['health-healthy'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'meal-unripe-plantain-porridge',
    name: 'Unripe Plantain Porridge',
    description: 'Nutritious porridge made with unripe plantain, palm oil, dried fish, and leafy vegetables. A traditional Nigerian dish that\'s diabetic-friendly and packed with nutrients.',
    price: '5500.00',
    isAvailable: 1,
    restaurantId: 'rest-nok-alara',
    dietaryTags: ['diabetic-friendly', 'low-glycemic', 'traditional', 'gluten-free', 'high-fiber', 'nutrient-dense'],
    allergens: ['fish'],
    nutritionalInfo: { 
      calories: 320, 
      protein: 18, 
      carbs: 42, 
      fat: 12,
      sugars: 8,
      fiber: 12,
      sodium: 520
    },
    restaurant: RESTAURANTS['nok-alara'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'meal-veggie-sauce-yam',
    name: 'Veggie Sauce and Yam',
    description: 'Boiled yam served with vegetable sauce made from spinach, tomatoes, onions, and bell peppers. A wholesome vegetarian meal rich in vitamins and minerals.',
    price: '4500.00',
    isAvailable: 1,
    restaurantId: 'rest-green-chef',
    dietaryTags: ['vegetarian', 'gluten-free', 'high-fiber', 'vitamin-rich', 'traditional', 'wholesome'],
    allergens: [],
    nutritionalInfo: { 
      calories: 380, 
      protein: 12, 
      carbs: 72, 
      fat: 6,
      sugars: 18,
      fiber: 12,
      sodium: 320
    },
    restaurant: RESTAURANTS['green-chef'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'meal-almond-flour-soup',
    name: 'Almond Flour and Soup',
    description: 'Gluten-free almond flour bread served with hearty vegetable soup made with carrots, celery, onions, and herbs. A comforting meal perfect for those with dietary restrictions.',
    price: '6500.00',
    isAvailable: 1,
    restaurantId: 'rest-so-fresh',
    dietaryTags: ['gluten-free', 'keto-friendly', 'low-carb', 'high-protein', 'vegetarian', 'nut-based'],
    allergens: ['nuts'],
    nutritionalInfo: { 
      calories: 350, 
      protein: 16, 
      carbs: 18, 
      fat: 26,
      sugars: 8,
      fiber: 8,
      sodium: 420
    },
    restaurant: RESTAURANTS['so-fresh'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Create image mapping for meals
const MEAL_IMAGES: { [key: string]: any } = {
  'meal-fruity-oats': require('../assets/meals/Fruity Oats delight.png'),
  'meal-avocado-toast-egg': require('../assets/meals/Avocado Toast and Egg.png'),
  'meal-avocado-veggie-bowl': require('../assets/meals/Avocado Veggie Bowl.png'),
  'meal-basmati-jollof': require('../assets/meals/Basmati Jollof Rice.png'),
  'meal-beans-potato': require('../assets/meals/Beans and Potato.png'),
  'meal-fruity-pancakes': require('../assets/meals/Fruity pancakes.png'),
  'meal-grilled-fish-veggies': require('../assets/meals/Grilled Fish and Veggies.png'),
  'meal-moi-moi-akamu': require('../assets/meals/Moi moi and Akamu.png'),
  'meal-ofada-rice-sauce': require('../assets/meals/Ofada Rice and Sauce.png'),
  'meal-peanut-butter-toast': require('../assets/meals/Peanut Butter Toast.png'),
  'meal-plantain-egg-sauce': require('../assets/meals/Plantain and Egg sauce.png'),
  'meal-plantain-soup': require('../assets/meals/Plantain and Soup.png'),
  'meal-sauce-yam': require('../assets/meals/Sauce and Yam.png'),
  'meal-tofu-rice': require('../assets/meals/Tofu Rice.png'),
  'meal-turkey-salad': require('../assets/meals/Turkey and Salad.png'),
  'meal-unripe-plantain-porridge': require('../assets/meals/Unripe Plantain porridge.png'),
  'meal-veggie-sauce-yam': require('../assets/meals/Veggie Sauce and Yam.png'),
  'meal-almond-flour-soup': require('../assets/meals/Almond Flour and Soup.png')
};

// Enhanced meal conversion with images
function convertMealWithImage(meal: BackendMeal): BackendMeal {
  return {
    ...meal,
    image: MEAL_IMAGES[meal.id] || null
  };
}

// Main hybrid meals function
export async function getHybridMeals(): Promise<{ success: boolean; data: BackendMeal[]; message: string }> {
  try {
    console.log('🍽️ Loading hybrid meals (backend + comprehensive local)...');
    
    // First try to get backend meals
    let backendMeals: BackendMeal[] = [];
    try {
      const backendResponse = await getAllMeals();
      if (backendResponse.success && backendResponse.data) {
        // Filter out duplicate/low-quality backend meals
        const filteredBackendMeals = backendResponse.data.filter(meal => {
          // Remove duplicate "Plantain elubo" meals and meals without proper images
          const isDuplicatePlantain = meal.name.toLowerCase().includes('plantain elubo');
          const hasValidImage = meal.image && meal.image !== null;
          
          // Only keep backend meals that are not duplicates and have images
          return !isDuplicatePlantain && hasValidImage;
        });
        
        backendMeals = filteredBackendMeals;
        console.log(`✅ Loaded ${backendMeals.length} quality meals from backend (filtered out duplicates)`);
      }
    } catch (error) {
      console.log('⚠️ Backend meals unavailable, using comprehensive local meals only');
    }
    
    // Combine filtered backend meals with comprehensive local meals
    const allMeals = [...backendMeals, ...COMPREHENSIVE_MEALS];
    
    // Remove any remaining duplicates by name (case-insensitive)
    const uniqueMeals = allMeals.filter((meal, index, self) => 
      index === self.findIndex(m => 
        m.name.toLowerCase().trim() === meal.name.toLowerCase().trim()
      )
    );
    
    // Add images to all meals
    const mealsWithImages = uniqueMeals.map(convertMealWithImage);
    
    console.log(`🎯 Total unique hybrid meals: ${mealsWithImages.length} (${backendMeals.length} backend + ${COMPREHENSIVE_MEALS.length} local, deduplicated)`);
    
    return {
      success: true,
      data: mealsWithImages,
      message: `Loaded ${mealsWithImages.length} unique hybrid meals successfully`
    };
    
  } catch (error: any) {
    console.error('❌ Error loading hybrid meals:', error);
    
    // Fallback to comprehensive local meals only
    const localMealsWithImages = COMPREHENSIVE_MEALS.map(convertMealWithImage);
    
    return {
      success: true,
      data: localMealsWithImages,
      message: `Loaded ${localMealsWithImages.length} local meals (backend unavailable)`
    };
  }
}

// Get hybrid restaurants
export async function getHybridRestaurants(): Promise<{ success: boolean; data: any[]; message: string }> {
  const restaurantArray = Object.values(RESTAURANTS).map(restaurant => ({
    restaurantId: restaurant.id,
    restaurantName: restaurant.name,
    location: restaurant.location,
    cuisineType: restaurant.cuisineType,
    image: restaurant.image,
    rating: restaurant.rating,
    reviewCount: restaurant.reviewCount,
    deliveryTime: restaurant.deliveryTime,
    priceRange: restaurant.priceRange
  }));
  
  return {
    success: true,
    data: restaurantArray,
    message: `Loaded ${restaurantArray.length} restaurants successfully`
  };
}

// Get meals by restaurant
export async function getHybridMealsByRestaurant(restaurantId: string): Promise<{ success: boolean; data: BackendMeal[]; message: string }> {
  try {
    console.log(`🏪 Loading meals for restaurant: ${restaurantId}`);
    
    const hybridMealsResponse = await getHybridMeals();
    if (!hybridMealsResponse.success) {
      return hybridMealsResponse;
    }
    
    // Filter meals that belong to this specific restaurant
    const restaurantMeals = hybridMealsResponse.data.filter(meal => {
      const belongsToRestaurant = meal.restaurantId === restaurantId;
      if (belongsToRestaurant) {
        console.log(`✅ Meal "${meal.name}" belongs to restaurant ${restaurantId} with image:`, meal.image ? 'YES' : 'NO');
      }
      return belongsToRestaurant;
    });
    
    console.log(`🎯 Found ${restaurantMeals.length} meals for restaurant ${restaurantId}`);
    
    // If no meals found for this restaurant, return empty array instead of fallback
    if (restaurantMeals.length === 0) {
      console.log(`⚠️ No meals found for restaurant ${restaurantId}`);
    }
    
    return {
      success: true,
      data: restaurantMeals,
      message: `Found ${restaurantMeals.length} meals for restaurant`
    };
  } catch (error: any) {
    console.error(`❌ Error loading meals for restaurant ${restaurantId}:`, error);
    return {
      success: false,
      data: [],
      message: error.message || 'Failed to load restaurant meals'
    };
  }
}

// Get meal by ID
export async function getHybridMealById(mealId: string): Promise<{ success: boolean; data: BackendMeal | null; message: string }> {
  try {
    const hybridMealsResponse = await getHybridMeals();
    if (!hybridMealsResponse.success) {
      return { success: false, data: null, message: hybridMealsResponse.message };
    }
    
    const meal = hybridMealsResponse.data.find(meal => meal.id === mealId);
    
    if (meal) {
      return {
        success: true,
        data: meal,
        message: 'Meal found successfully'
      };
    } else {
      return {
        success: false,
        data: null,
        message: 'Meal not found'
      };
    }
  } catch (error: any) {
    return {
      success: false,
      data: null,
      message: error.message || 'Failed to load meal'
    };
  }
}

// Comprehensive search function
export async function searchMealsAndRestaurants(query: string, filters: string[] = []): Promise<{
  success: boolean;
  data: {
    meals: BackendMeal[];
    restaurants: any[];
  };
  message: string;
}> {
  try {
    console.log(`🔍 Comprehensive search for: "${query}" with filters: [${filters.join(', ')}]`);
    
    // Get all available data
    const [mealsResponse, restaurantsResponse] = await Promise.all([
      getHybridMeals(),
      getHybridRestaurants()
    ]);
    
    let searchResults = {
      meals: [] as BackendMeal[],
      restaurants: [] as any[]
    };
    
    if (mealsResponse.success && mealsResponse.data) {
      const queryLower = query.toLowerCase();
      
      // Comprehensive meal search
      searchResults.meals = mealsResponse.data.filter(meal => {
        // Text matching
        const textMatch = 
          meal.name.toLowerCase().includes(queryLower) ||
          meal.description.toLowerCase().includes(queryLower) ||
          meal.dietaryTags.some(tag => tag.toLowerCase().includes(queryLower)) ||
          (meal.restaurant?.name && meal.restaurant.name.toLowerCase().includes(queryLower)) ||
          meal.allergens.some(allergen => allergen.toLowerCase().includes(queryLower));
        
        // Price range matching (if query is a number)
        const priceMatch = !isNaN(Number(query)) && 
          (parseFloat(meal.price) <= Number(query) * 1.2 && parseFloat(meal.price) >= Number(query) * 0.8);
        
        // Nutritional matching
        const nutritionMatch = meal.nutritionalInfo && (
          (queryLower.includes('calorie') && meal.nutritionalInfo.calories) ||
          (queryLower.includes('protein') && meal.nutritionalInfo.protein) ||
          (queryLower.includes('carb') && meal.nutritionalInfo.carbs) ||
          (queryLower.includes('fat') && meal.nutritionalInfo.fat)
        );
        
        const matchesSearch = textMatch || priceMatch || nutritionMatch;
        
        // Apply filters if provided
        if (filters.length > 0 && matchesSearch) {
          return filters.some(filter => 
            meal.dietaryTags.some(tag => 
              tag.toLowerCase().includes(filter.toLowerCase()) ||
              filter.toLowerCase().includes(tag.toLowerCase())
            )
          );
        }
        
        return matchesSearch;
      });
    }
    
    if (restaurantsResponse.success && restaurantsResponse.data) {
      const queryLower = query.toLowerCase();
      
      // Comprehensive restaurant search
      searchResults.restaurants = restaurantsResponse.data.filter(restaurant => {
        const textMatch = 
          restaurant.restaurantName.toLowerCase().includes(queryLower) ||
          restaurant.location.toLowerCase().includes(queryLower) ||
          restaurant.cuisineType.toLowerCase().includes(queryLower) ||
          restaurant.priceRange.toLowerCase().includes(queryLower);
        
        const matchesSearch = textMatch;
        
        // Apply filters if provided (for restaurants, filters might be cuisine types)
        if (filters.length > 0 && matchesSearch) {
          return filters.some(filter => 
            restaurant.cuisineType.toLowerCase().includes(filter.toLowerCase())
          );
        }
        
        return matchesSearch;
      });
    }
    
    console.log(`🎯 Search found: ${searchResults.meals.length} meals, ${searchResults.restaurants.length} restaurants`);
    
    return {
      success: true,
      data: searchResults,
      message: `Found ${searchResults.meals.length} meals and ${searchResults.restaurants.length} restaurants`
    };
    
  } catch (error: any) {
    console.error('❌ Search error:', error);
    return {
      success: false,
      data: { meals: [], restaurants: [] },
      message: error.message || 'Search failed'
    };
  }
}

// Export restaurants for easy access
export { RESTAURANTS }; 