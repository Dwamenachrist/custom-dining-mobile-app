// Mock data for development - use this instead of backend API calls
// This file contains sample data that matches the backend structure

export interface MockMeal {
  id: number;
  name: string;
  description: string;
  dietaryTags: string[];
  nutritionalInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  allergens: string[];
  restaurantId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MockRestaurant {
  id: string;
  name: string;
  location: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  image: string;
}

// Notification interfaces
export interface MockCustomerNotification {
  id: string;
  type: 'All' | 'Orders' | 'Promotions' | 'Reminders';
  title: string;
  message: string;
  timeAgo: string;
  icon: string;
  iconBg: string;
}

export interface MockRestaurantNotification {
  id: string;
  type: 'All' | 'Orders' | 'Performance' | 'Reminders';
  title: string;
  message: string;
  timeAgo: string;
  icon: string;
  iconBg: string;
}

// Restaurant profile data
export interface RestaurantProfile {
  id: string;
  name: string;
  address: string;
  coverImage: any;
  tags: string[];
  rating: number;
  reviewCount: number;
  popularMeals: PopularMeal[];
  description?: string;
  phone?: string;
  hours?: string;
}

export interface PopularMeal {
  id: string;
  name: string;
  description: string;
  image: any;
  price?: number;
  category: string;
  isVegan?: boolean;
  isDiabeticFriendly?: boolean;
}

// Sample meals data
export const mockMeals: MockMeal[] = [
  {
    id: 1,
    name: "Grilled Chicken Salad",
    description: "Fresh salad with grilled chicken breast.",
    dietaryTags: ["low-carb", "high-protein"],
    nutritionalInfo: {
      calories: 350,
      protein: 40,
      carbs: 10,
      fat: 15
    },
    allergens: ["celery", "mustard"],
    restaurantId: null,
    createdAt: "2025-06-17T14:41:18.000Z",
    updatedAt: "2025-06-17T14:41:18.000Z"
  },
  {
    id: 2,
    name: "Vegetable Stir-fry with Tofu",
    description: "Colourful stir-fry with mixed vegetables and tofu.",
    dietaryTags: ["low-carb", "diabetic-friendly", "vegan"],
    nutritionalInfo: {
      calories: 300,
      protein: 25,
      carbs: 20,
      fat: 12
    },
    allergens: ["soy"],
    restaurantId: null,
    createdAt: "2025-06-17T14:41:18.000Z",
    updatedAt: "2025-06-17T14:41:18.000Z"
  },
  {
    id: 3,
    name: "Salmon with Asparagus",
    description: "Baked salmon with steamed asparagus.",
    dietaryTags: ["high-protein", "low-sugar"],
    nutritionalInfo: {
      calories: 400,
      protein: 35,
      carbs: 15,
      fat: 20
    },
    allergens: ["fish"],
    restaurantId: null,
    createdAt: "2025-06-17T14:41:18.000Z",
    updatedAt: "2025-06-17T14:41:18.000Z"
  },
  {
    id: 4,
    name: "Whole Wheat Pasta with Lean Meat Sauce",
    description: "Hearty pasta dish with lean ground beef.",
    dietaryTags: ["high-protein"],
    nutritionalInfo: {
      calories: 450,
      protein: 30,
      carbs: 50,
      fat: 15
    },
    allergens: ["gluten"],
    restaurantId: null,
    createdAt: "2025-06-17T14:41:18.000Z",
    updatedAt: "2025-06-17T14:41:18.000Z"
  },
  {
    id: 5,
    name: "Lentil Soup",
    description: "Nutritious and filling lentil soup.",
    dietaryTags: ["low-fat", "diabetic-friendly", "vegan"],
    nutritionalInfo: {
      calories: 250,
      protein: 15,
      carbs: 35,
      fat: 5
    },
    allergens: ["peanut"],
    restaurantId: null,
    createdAt: "2025-06-17T14:41:18.000Z",
    updatedAt: "2025-06-17T14:41:18.000Z"
  },
  {
    id: 6,
    name: "Beef Stew",
    description: "Classic beef stew with vegetables.",
    dietaryTags: ["high-protein"],
    nutritionalInfo: {
      calories: 400,
      protein: 45,
      carbs: 30,
      fat: 12
    },
    allergens: ["celery"],
    restaurantId: null,
    createdAt: "2025-06-17T14:41:18.000Z",
    updatedAt: "2025-06-17T14:41:18.000Z"
  },
  {
    id: 7,
    name: "Gluten-Free Chicken Curry",
    description: "Spicy chicken curry with coconut milk, no gluten.",
    dietaryTags: ["low-carb", "gluten-free"],
    nutritionalInfo: {
      calories: 380,
      protein: 40,
      carbs: 15,
      fat: 18
    },
    allergens: ["nuts"],
    restaurantId: null,
    createdAt: "2025-06-17T14:41:18.000Z",
    updatedAt: "2025-06-17T14:41:18.000Z"
  },
  {
    id: 8,
    name: "Almond Flour Pancakes",
    description: "Delicious pancakes made with almond flour.",
    dietaryTags: ["low-carb", "high-protein", "diabetic-friendly", "gluten-free"],
    nutritionalInfo: {
      calories: 320,
      protein: 20,
      carbs: 12,
      fat: 22
    },
    allergens: ["nuts", "eggs"],
    restaurantId: null,
    createdAt: "2025-06-17T14:41:18.000Z",
    updatedAt: "2025-06-17T14:41:18.000Z"
  }
];

// Sample customer notifications data
export const mockCustomerNotifications: MockCustomerNotification[] = [
  {
    id: '1',
    type: 'All',
    title: 'Meal Plan Ready',
    message: 'Your 5-day vegetarian meal plan is ready.',
    timeAgo: '1m ago',
    icon: 'notifications',
    iconBg: '#A7D2A5'
  },
  {
    id: '2',
    type: 'Orders',
    title: 'Order Confirmed',
    message: 'Your order #23145675 has been confirmed.',
    timeAgo: '10m ago',
    icon: 'checkmark-circle',
    iconBg: '#A7D2A5'
  },
  {
    id: '3',
    type: 'Reminders',
    title: 'Reminder',
    message: 'Drink a glass of water before meals.',
    timeAgo: '30m ago',
    icon: 'document-text',
    iconBg: '#A7D2A5'
  },
  {
    id: '4',
    type: 'Promotions',
    title: 'Special Offers / Discounts',
    message: 'Partner restaurant deal: Free smoothie with your meal.',
    timeAgo: '2h ago',
    icon: 'pricetag',
    iconBg: '#A7D2A5'
  },
  {
    id: '5',
    type: 'All',
    title: 'Motivations Boosters',
    message: 'Healthy eating is a journey, keep pushing forward.',
    timeAgo: '2h ago',
    icon: 'rocket',
    iconBg: '#A7D2A5'
  },
];

// Sample restaurant notifications data
export const mockRestaurantNotifications: MockRestaurantNotification[] = [
  {
    id: '1',
    type: 'Orders',
    title: 'Order #1054 Confirmed',
    message: 'Your customer\'s meal order has been successfully placed',
    timeAgo: '1m ago',
    icon: 'checkmark-circle',
    iconBg: '#A7D2A5'
  },
  {
    id: '2',
    type: 'Performance',
    title: 'New Promotion Live',
    message: '"Buy 2, Get 1 free smoothie" is now active on your menu.',
    timeAgo: '10m ago',
    icon: 'gift',
    iconBg: '#A7D2A5'
  },
  {
    id: '3',
    type: 'Performance',
    title: 'Customer Feedback Received',
    message: 'Loved the grilled fish! 4.8 rating from a recent customers',
    timeAgo: '30m ago',
    icon: 'chatbubble',
    iconBg: '#A7D2A5'
  },
  {
    id: '4',
    type: 'Reminders',
    title: 'Reminder: Update Menu',
    message: 'Don\'t forget to update your weekend specials.',
    timeAgo: '2h ago',
    icon: 'time',
    iconBg: '#A7D2A5'
  },
  {
    id: '5',
    type: 'Performance',
    title: 'Daily Sales Report',
    message: 'Review todays performance, insights and key.',
    timeAgo: '2h ago',
    icon: 'rocket',
    iconBg: '#A7D2A5'
  },
];

// Sample restaurants data
export const mockRestaurants: MockRestaurant[] = [
  {
    id: "1",
    name: "Healthy Bites",
    location: "Downtown Lagos",
    cuisine: "Health Food",
    rating: 4.8,
    deliveryTime: "25-30 mins",
    image: "restaurant1"
  },
  {
    id: "2", 
    name: "Green Garden",
    location: "Victoria Island",
    cuisine: "Vegetarian",
    rating: 4.6,
    deliveryTime: "30-35 mins",
    image: "restaurant2"
  },
  {
    id: "3",
    name: "Protein Palace",
    location: "Ikeja",
    cuisine: "High Protein",
    rating: 4.7,
    deliveryTime: "20-25 mins",
    image: "restaurant3"
  }
];

// Mock restaurant profiles
export const mockRestaurantProfiles: { [key: string]: RestaurantProfile } = {
  '1': {
    id: '1',
    name: 'Health n Healthy',
    address: '123, veggies street, Ikeja, Lagos',
    coverImage: require('../assets/restaurant1.png'),
    tags: ['Vegan Friendly', 'Diabetic-Friendly', 'Plant-Based'],
    rating: 4.8,
    reviewCount: 245,
    description: 'Your health is our priority. We serve fresh, organic meals.',
    phone: '+234 801 234 5678',
    hours: '8:00 AM - 10:00 PM',
    popularMeals: [
      {
        id: '1',
        name: 'Basmati Jollof Rice',
        description: 'Basmati rice with grilled chicken and fresh veggies',
        image: require('../assets/lunch.png'),
        price: 2500,
        category: 'Lunch',
        isDiabeticFriendly: true,
      },
      {
        id: '2',
        name: 'Fruity Oats Delight',
        description: 'A delightful bowl of oats topped with mixed fruits',
        image: require('../assets/breakfast.png'),
        price: 1800,
        category: 'Breakfast',
        isVegan: true,
      },
    ],
  },
  '2': {
    id: '2',
    name: 'So Fresh',
    address: '45, fresh avenue, Victoria Island, Lagos',
    coverImage: require('../assets/restaurant2.png'),
    tags: ['Low-Carb', 'Sugar-Free', 'Organic'],
    rating: 4.6,
    reviewCount: 189,
    description: 'Fresh ingredients, amazing taste, healthy living.',
    phone: '+234 802 345 6789',
    hours: '7:00 AM - 9:00 PM',
    popularMeals: [
      {
        id: '3',
        name: 'Quinoa Power Bowl',
        description: 'Nutrient-packed quinoa with grilled vegetables and lean protein',
        image: require('../assets/dinner.png'),
        price: 3200,
        category: 'Dinner',
        isVegan: true,
      },
      {
        id: '4',
        name: 'Green Smoothie Bowl',
        description: 'Refreshing green smoothie topped with nuts and seeds',
        image: require('../assets/breakfast.png'),
        price: 2100,
        category: 'Breakfast',
        isVegan: true,
      },
    ],
  },
  '3': {
    id: '3',
    name: 'Addys Health Kitchen',
    address: '78, wellness road, Lekki, Lagos',
    coverImage: require('../assets/restaurant3.png'),
    tags: ['Vegan', 'Low-Carb', 'Keto-Friendly'],
    rating: 4.7,
    reviewCount: 312,
    description: 'Transforming lives through healthy, delicious meals.',
    phone: '+234 803 456 7890',
    hours: '6:00 AM - 11:00 PM',
    popularMeals: [
      {
        id: '5',
        name: 'Cauliflower Rice Bowl',
        description: 'Low-carb cauliflower rice with seasoned vegetables',
        image: require('../assets/lunch.png'),
        price: 2800,
        category: 'Lunch',
        isVegan: true,
      },
      {
        id: '6',
        name: 'Avocado Toast Supreme',
        description: 'Whole grain toast topped with fresh avocado and seeds',
        image: require('../assets/breakfast.png'),
        price: 2200,
        category: 'Breakfast',
        isVegan: true,
      },
    ],
  },
};

// Mock API functions that simulate backend calls
export const mockApi = {
  // Simulate getting all meals
  async getMeals(): Promise<MockMeal[]> {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    return mockMeals;
  },

  // Simulate adding a new meal
  async addMeal(mealData: {
    name: string;
    description: string;
    price: number;
    dietaryTags: string[];
    restaurantId?: string;
  }): Promise<{ success: boolean; id: number; message: string }> {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
    
    const newId = Math.max(...mockMeals.map(m => m.id)) + 1;
    
    // You could add the new meal to the mock array if needed
    // const newMeal = { ...mealData, id: newId, ... };
    // mockMeals.push(newMeal);
    
    return {
      success: true,
      id: newId,
      message: "Meal added successfully!"
    };
  },

  // Simulate getting restaurants
  async getRestaurants(): Promise<MockRestaurant[]> {
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
    return mockRestaurants;
  },

  // Simulate getting customer notifications
  async getCustomerNotifications(): Promise<MockCustomerNotification[]> {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    return mockCustomerNotifications;
  },

  // Simulate getting restaurant notifications
  async getRestaurantNotifications(): Promise<MockRestaurantNotification[]> {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    return mockRestaurantNotifications;
  },

  // Get restaurant profile by ID
  async getRestaurantProfile(id: string): Promise<RestaurantProfile | null> {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
    return mockRestaurantProfiles[id] || null;
  },

  // Get popular meals for a restaurant
  async getPopularMeals(restaurantId: string): Promise<PopularMeal[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const restaurant = mockRestaurantProfiles[restaurantId];
    return restaurant ? restaurant.popularMeals : [];
  },

  // Search restaurants
  async searchRestaurants(query: string): Promise<RestaurantProfile[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const restaurants = Object.values(mockRestaurantProfiles);
    
    if (!query.trim()) return restaurants;
    
    return restaurants.filter(restaurant =>
      restaurant.name.toLowerCase().includes(query.toLowerCase()) ||
      restaurant.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())) ||
      restaurant.address.toLowerCase().includes(query.toLowerCase())
    );
  }
};

export default mockApi; 