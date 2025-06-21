import { getAllMeals, getAllRestaurants, Meal, Restaurant } from './api';

// Asset mapping interfaces
export interface MealAssetMapping {
  backendId: string;
  name: string;
  description: string;
  restaurantName: string;
  imagePath: any;
  rating: number;
  reviewCount: number;
  popularity: number;
}

export interface RestaurantAssetMapping {
  backendId: string;
  name: string;
  location: string;
  cuisineType: string;
  imagePath: any;
  coverImagePath: any;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  priceRange: string;
}

// Specific mappings for your backend data - using available meal images
const MEAL_IMAGE_MAP: { [key: string]: any } = {
  'basmati-jollof-rice': require('../assets/meals/Basmati Jollof Rice.png'),
  'fruity-oats-delight': require('../assets/meals/Fruity Oats delight.png'),
  'grilled-fish-and-veggies': require('../assets/meals/Grilled Fish and Veggies.png'),
  'avocado-toast-and-egg': require('../assets/meals/Avocado Toast and Egg.png'),
  'avocado-veggie-bowl': require('../assets/meals/Avocado Veggie Bowl.png'),
  'tofu-rice': require('../assets/meals/Tofu Rice.png'),
  'turkey-and-salad': require('../assets/meals/Turkey and Salad.png'),
  'beans-and-potato': require('../assets/meals/Beans and Potato.png'),
  'plantain-and-soup': require('../assets/meals/Plantain and Soup.png'),
  'plantain-and-egg-sauce': require('../assets/meals/Plantain and Egg sauce.png'),
  'unripe-plantain-porridge': require('../assets/meals/Unripe Plantain porridge.png'),
  'ofada-rice-and-sauce': require('../assets/meals/Ofada Rice and Sauce.png'),
  'moi-moi-and-akamu': require('../assets/meals/Moi moi and Akamu.png'),
  'peanut-butter-toast': require('../assets/meals/Peanut Butter Toast.png'),
  'fruity-pancakes': require('../assets/meals/Fruity pancakes.png'),
  'almond-flour-and-soup': require('../assets/meals/Almond Flour and Soup.png'),
  'sauce-and-yam': require('../assets/meals/Sauce and Yam.png'),
  'veggie-sauce-and-yam': require('../assets/meals/Veggie Sauce and Yam.png'),
  'fallback': require('../assets/meals/Basmati Jollof Rice.png'),
};

const RESTAURANT_IMAGE_MAP: { [key: string]: { image: any, cover: any, rating: number, reviewCount: number, deliveryTime: string, priceRange: string } } = {
  'green-chef-kitchen': {
    image: require('../assets/restaurants/Green Chef Kitchen.png'),
    cover: require('../assets/restaurants/Green Chef Kitchen.png'),
    rating: 4.8,
    reviewCount: 120,
    deliveryTime: '20-30 min',
    priceRange: '₦₦₦'
  },
  'health-n-healthy': {
    image: require('../assets/restaurants/Health n Healthy.png'),
    cover: require('../assets/restaurants/Health n Healthy.png'),
    rating: 4.6,
    reviewCount: 89,
    deliveryTime: '25-35 min',
    priceRange: '₦₦'
  },
  'nok-by-alara': {
    image: require('../assets/restaurants/NOK By Alara.png'),
    cover: require('../assets/restaurants/NOK By Alara.png'),
    rating: 4.7,
    reviewCount: 156,
    deliveryTime: '30-40 min',
    priceRange: '₦₦₦'
  },
  'addys-health-kitchen': {
    image: require('../assets/restaurants/Addys Health Kitchen.png'),
    cover: require('../assets/restaurants/Addys Health Kitchen.png'),
    rating: 4.5,
    reviewCount: 78,
    deliveryTime: '25-35 min',
    priceRange: '₦₦'
  },
  'green-grill-restaurant': {
    image: require('../assets/restaurants/Green Grill Resturant.png'),
    cover: require('../assets/restaurants/Green Grill Resturant.png'),
    rating: 4.4,
    reviewCount: 112,
    deliveryTime: '30-40 min',
    priceRange: '₦₦₦'
  },
  'fallback': {
    image: require('../assets/restaurants/Green Chef Kitchen.png'),
    cover: require('../assets/restaurants/Green Chef Kitchen.png'),
    rating: 4.0,
    reviewCount: 100,
    deliveryTime: '25-35 min',
    priceRange: '₦₦'
  }
};

// Enhanced ratings for Nigerian meals
const MEAL_RATINGS: { [key: string]: { rating: number, reviewCount: number, popularity: number } } = {
  'basmati-jollof-rice': {
    rating: 4.7,
    reviewCount: 234,
    popularity: 89
  },
  'fruity-oats-delight': {
    rating: 4.8,
    reviewCount: 189,
    popularity: 92
  },
  'grilled-fish-and-veggies': {
    rating: 4.6,
    reviewCount: 156,
    popularity: 85
  },
  'avocado-toast-and-egg': {
    rating: 4.5,
    reviewCount: 143,
    popularity: 78
  },
  'tofu-rice': {
    rating: 4.4,
    reviewCount: 98,
    popularity: 72
  }
};

// Convert meal name to image key
function getMealImageKey(mealName: string): string {
  return mealName.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
}

// Convert restaurant name to image key
function getRestaurantImageKey(restaurantName: string): string {
  return restaurantName.toLowerCase().replace(/\s+/g, '-');
}

// Simple function to get asset from meal name (for use in components)
export function getAssetFromMapping(mealName: string): any {
  if (!mealName) return MEAL_IMAGE_MAP['fallback'];
  const key = getMealImageKey(mealName);
  return MEAL_IMAGE_MAP[key] || MEAL_IMAGE_MAP['fallback'];
}

// Simple function to get restaurant asset
export function getRestaurantAssetFromMapping(restaurantName: string): any {
  if (!restaurantName) return RESTAURANT_IMAGE_MAP['fallback'].image;
  const key = getRestaurantImageKey(restaurantName);
  return RESTAURANT_IMAGE_MAP[key]?.image || RESTAURANT_IMAGE_MAP['fallback'].image;
}

// Fetch and map backend data with local assets
export async function generateAssetMappings(): Promise<{
  meals: MealAssetMapping[];
  restaurants: RestaurantAssetMapping[];
}> {
  try {
    console.log('🔍 Fetching backend data for asset mapping...');
    
    const [mealsResponse, restaurantsResponse] = await Promise.all([
      getAllMeals(),
      getAllRestaurants()
    ]);

    // Map meals with local assets
    const meals: MealAssetMapping[] = [];
    if (mealsResponse.success && mealsResponse.data) {
      mealsResponse.data.forEach((meal) => {
        const imageKey = getMealImageKey(meal.name);
        const mealRating = MEAL_RATINGS[imageKey] || { rating: 4.5, reviewCount: 100, popularity: 75 };
        
        meals.push({
          backendId: meal.id,
          name: meal.name,
          description: meal.description,
          restaurantName: meal.restaurant?.name || `Restaurant ${meal.restaurantId}`,
          imagePath: MEAL_IMAGE_MAP[imageKey] || MEAL_IMAGE_MAP['fallback'],
          rating: mealRating.rating,
          reviewCount: mealRating.reviewCount,
          popularity: mealRating.popularity
        });
      });
    }

    // Map restaurants with local assets
    const restaurants: RestaurantAssetMapping[] = [];
    if (restaurantsResponse.success && restaurantsResponse.data) {
      restaurantsResponse.data.forEach((restaurant) => {
        const imageKey = getRestaurantImageKey(restaurant.restaurantName);
        const restaurantAssets = RESTAURANT_IMAGE_MAP[imageKey] || RESTAURANT_IMAGE_MAP['fallback'];
        
        restaurants.push({
          backendId: restaurant.restaurantId,
          name: restaurant.restaurantName,
          location: restaurant.location,
          cuisineType: restaurant.cuisineType,
          imagePath: restaurantAssets.image,
          coverImagePath: restaurantAssets.cover,
          rating: restaurantAssets.rating,
          reviewCount: restaurantAssets.reviewCount,
          deliveryTime: restaurantAssets.deliveryTime,
          priceRange: restaurantAssets.priceRange
        });
      });
    }

    console.log('✅ Asset mappings generated!');
    console.log(`📊 Mapped ${meals.length} meals and ${restaurants.length} restaurants`);
    
    return { meals, restaurants };
    
  } catch (error) {
    console.error('❌ Error generating asset mappings:', error);
    return { meals: [], restaurants: [] };
  }
}

// Get asset mapping for a specific meal
export function getMealAssetMapping(backendId: string, mappings: MealAssetMapping[]): MealAssetMapping | null {
  return mappings.find(mapping => mapping.backendId === backendId) || null;
}

// Get asset mapping for a specific restaurant
export function getRestaurantAssetMapping(backendId: string, mappings: RestaurantAssetMapping[]): RestaurantAssetMapping | null {
  return mappings.find(mapping => mapping.backendId === backendId) || null;
}

// Enhanced meal conversion with assets
export function convertBackendMealWithAssets(meal: Meal, assetMapping: MealAssetMapping | null) {
  return {
    id: meal.id,
    name: meal.name,
    description: meal.description,
    dietaryTags: meal.dietaryTags,
    nutritionalInfo: {
      calories: meal.nutritionalInfo?.calories || 400,
      protein: meal.nutritionalInfo?.protein || 20,
      carbs: meal.nutritionalInfo?.carbs || 30,
      fat: meal.nutritionalInfo?.fat || 15,
      fiber: 5,
      iron: 10
    },
    allergens: meal.allergens,
    restaurantId: meal.restaurantId,
    restaurant: meal.restaurant?.name || `Restaurant ${meal.restaurantId || 'Unknown'}`,
    // Use asset mapping or fallback
    image: assetMapping?.imagePath || MEAL_IMAGE_MAP['fallback'],
    price: parseFloat(meal.price) || 3000,
    available: meal.isAvailable === 1,
    rating: assetMapping?.rating || 4.5,
    reviewCount: assetMapping?.reviewCount || 100,
    popularity: assetMapping?.popularity || 75,
    createdAt: meal.createdAt,
    updatedAt: meal.updatedAt
  };
}

// Enhanced restaurant conversion with assets
export function convertBackendRestaurantWithAssets(restaurant: Restaurant, assetMapping: RestaurantAssetMapping | null) {
  return {
    id: restaurant.restaurantId,
    name: restaurant.restaurantName,
    location: restaurant.location,
    cuisineType: restaurant.cuisineType,
    // Use asset mapping or fallback
    image: assetMapping?.imagePath || RESTAURANT_IMAGE_MAP['fallback'].image,
    coverImage: assetMapping?.coverImagePath || RESTAURANT_IMAGE_MAP['fallback'].cover,
    rating: assetMapping?.rating || 4.0,
    reviewCount: assetMapping?.reviewCount || 100,
    deliveryTime: assetMapping?.deliveryTime || '25-35 min',
    priceRange: assetMapping?.priceRange || '₦₦',
    status: restaurant.status,
    isActive: restaurant.isActive,
    tags: [restaurant.cuisineType],
    distance: '2.0 km', // Default since backend doesn't provide
  };
}

// Debug function to print all mappings
export async function debugPrintMappings() {
  const mappings = await generateAssetMappings();
  
  console.log('\n🍽️ MEAL MAPPINGS:');
  mappings.meals.forEach(meal => {
    console.log(`📋 ${meal.name} (${meal.backendId})`);
    console.log(`   🏪 Restaurant: ${meal.restaurantName}`);
    console.log(`   ⭐ Rating: ${meal.rating.toFixed(1)} (${meal.reviewCount} reviews)`);
    console.log(`   📈 Popularity: ${meal.popularity}%`);
    console.log('');
  });
  
  console.log('\n🏪 RESTAURANT MAPPINGS:');
  mappings.restaurants.forEach(restaurant => {
    console.log(`📋 ${restaurant.name} (${restaurant.backendId})`);
    console.log(`   📍 Location: ${restaurant.location}`);
    console.log(`   🍽️ Cuisine: ${restaurant.cuisineType}`);
    console.log(`   ⭐ Rating: ${restaurant.rating.toFixed(1)} (${restaurant.reviewCount} reviews)`);
    console.log(`   🚚 Delivery: ${restaurant.deliveryTime}`);
    console.log(`   💰 Price: ${restaurant.priceRange}`);
    console.log('');
  });
  
  return mappings;
} 