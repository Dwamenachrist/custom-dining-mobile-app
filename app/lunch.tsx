// Updated lunch.tsx - Complete Order Now and Add to Plan functionality

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '../theme/colors';
import { useAuth } from '../auth-context';
import { useCart } from '../cart-context';
import MealPlanService from '../services/mealPlanService';
import { NotificationToast } from '../components/NotificationToast';
import { getHybridMeals } from '../services/hybridMealService';
import MealFilterService, { FilteredMeal as OriginalFilteredMeal } from '../services/mealFilterService';
import { addMealToFavorites, removeMealFromFavorites, getFavoriteMeals } from '../services/api';

type FilteredMeal = OriginalFilteredMeal & { isFavorite?: boolean };

interface Meal {
  id: string;
  name: string;
  description: string;
  image: any;
  tags: string[];
  calories: string;
  rating: number;
  price: number;
  restaurant?: string;
  isFavorite?: boolean;
}

const LUNCH_MEALS: Meal[] = [
  {
    id: '1',
    name: 'Basmati Jollof Rice',
    description: 'Aromatic basmati rice cooked in a rich tomato and pepper sauce',
    image: require('../assets/meals/Basmati Jollof Rice.png'),
    tags: ['Traditional', 'Spicy'],
    calories: '420 Cal Per Serving',
    rating: 4.6,
    price: 4500
  },
  {
    id: '2',
    name: 'Grilled Fish and Veggies',
    description: 'Fresh grilled fish served with seasonal vegetables',
    image: require('../assets/meals/Grilled Fish and Veggies.png'),
    tags: ['High-Protein', 'Low-Carb'],
    calories: '350 Cal Per Serving',
    rating: 4.7,
    price: 5500
  },
  {
    id: '3',
    name: 'Ofada Rice and Sauce',
    description: 'Local brown rice served with spicy palm oil sauce',
    image: require('../assets/meals/Ofada Rice and Sauce.png'),
    tags: ['Traditional', 'Spicy'],
    calories: '480 Cal Per Serving',
    rating: 4.5,
    price: 4000
  },
  {
    id: '4',
    name: 'Tofu Rice',
    description: 'Protein-rich tofu served with seasoned rice',
    image: require('../assets/meals/Tofu Rice.png'),
    tags: ['Vegan', 'High-Protein'],
    calories: '380 Cal Per Serving',
    rating: 4.4,
    price: 4200
  },
  {
    id: '5',
    name: 'Turkey and Salad',
    description: 'Lean turkey breast with fresh garden salad',
    image: require('../assets/meals/Turkey and Salad.png'),
    tags: ['High-Protein', 'Low-Carb'],
    calories: '320 Cal Per Serving',
    rating: 4.6,
    price: 5000
  },
  {
    id: '6',
    name: 'Avocado Veggie Bowl',
    description: 'Fresh avocado with mixed vegetables and quinoa',
    image: require('../assets/meals/Avocado Veggie Bowl.png'),
    tags: ['Vegan', 'Healthy-Fats'],
    calories: '360 Cal Per Serving',
    rating: 4.8,
    price: 4000
  }
];

export default function LunchScreen() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { addToCart } = useCart();
  const [selectedSort, setSelectedSort] = useState('Most Popular');
  const [meals, setMeals] = useState<FilteredMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'cart'>('success');
  const [personalizationInfo, setPersonalizationInfo] = useState<{
    isPersonalized: boolean;
    summary: string;
  }>({ isPersonalized: false, summary: '' });
  const [favoriteMealIds, setFavoriteMealIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadLunchMeals();
    loadPersonalizationInfo();
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    if (!isLoggedIn) return;
    
    try {
      const response = await getFavoriteMeals();
      if (response.success && response.data) {
        const favoriteIds = new Set(response.data.map(meal => meal.id));
        setFavoriteMealIds(favoriteIds);
      }
    } catch (error) {
      console.error('❌ Error loading favorites:', error);
    }
  };

  const loadPersonalizationInfo = async () => {
    const info = await MealFilterService.getPersonalizationInfo();
    setPersonalizationInfo({
      isPersonalized: info.isPersonalized,
      summary: info.summary
    });
  };

  const loadLunchMeals = async () => {
    try {
      setLoading(true);
      console.log('🍽️ Loading lunch meals...');
      
      const response = await getHybridMeals();
      
      if (response.success && response.data) {
        // Use the centralized filtering service
        const filteredMeals = await MealFilterService.filterMealsForCategory(
          response.data, 
          'lunch', 
          true // Apply dietary preferences filtering
        );
        
        if (filteredMeals.length === 0) {
          // Convert fallback meals to FilteredMeal format
          const fallbackMeals = LUNCH_MEALS.map(meal => ({
            ...meal,
            dietaryTags: meal.tags,
            category: 'lunch',
            isFavorite: favoriteMealIds.has(meal.id)
          }));
          setMeals(fallbackMeals);
        } else {
          // Add favorite status to filtered meals
          const mealsWithFavorites = filteredMeals.map(meal => ({
            ...meal,
            isFavorite: favoriteMealIds.has(meal.id)
          }));
          setMeals(mealsWithFavorites);
        }
      } else {
        // Convert fallback meals to FilteredMeal format
        const fallbackMeals = LUNCH_MEALS.map(meal => ({
          ...meal,
          dietaryTags: meal.tags,
          category: 'lunch',
          isFavorite: favoriteMealIds.has(meal.id)
        }));
        setMeals(fallbackMeals);
      }
      
      console.log('✅ Lunch meals loaded!');
    } catch (error) {
      console.error('❌ Error loading lunch meals:', error);
      // Convert fallback meals to FilteredMeal format
      const fallbackMeals = LUNCH_MEALS.map(meal => ({
        ...meal,
        dietaryTags: meal.tags,
        category: 'lunch',
        isFavorite: favoriteMealIds.has(meal.id)
      }));
      setMeals(fallbackMeals);
    } finally {
      setLoading(false);
    }
  };

  const handleMealPress = (meal: Meal) => {
    router.push({
      pathname: '/meal/[id]',
      params: { 
        id: meal.id,
        name: meal.name,
        description: meal.description,
        price: meal.price.toString(),
        calories: meal.calories,
        imageSource: JSON.stringify(meal.image),
        tags: JSON.stringify(meal.tags)
      }
    });
  };

  const handleAddToPlan = async (meal: Meal) => {
    if (!isLoggedIn) {
      router.push('/(auth)/customer-login');
      return;
    }
    
    try {
      const result = await MealPlanService.addMealToPlan(meal, 'Lunch');
      
      if (result.success) {
        setToastVisible(true);
        setToastMessage(result.message);
        setToastType('success');
      } else {
        setToastVisible(true);
        setToastMessage(result.message);
        setToastType('error');
      }
    } catch (error) {
      console.error('❌ Error adding meal to plan:', error);
      setToastVisible(true);
      setToastMessage('Failed to add meal to plan. Please try again.');
      setToastType('error');
    }
  };

  const handleOrder = (meal: Meal) => {
    if (!isLoggedIn) {
      router.push('/(auth)/customer-login');
      return;
    }
    
    // Add to cart
    addToCart({
      id: meal.id,
      name: meal.name,
      price: meal.price,
      image: meal.image,
      restaurant: meal.restaurant || 'Restaurant'
    });
    
    // Show cart toast
    setToastVisible(true);
    setToastMessage(`${meal.name} added to cart!`);
    setToastType('cart');
    
    console.log('Added to cart:', meal.name);
  };

  const handleFavoriteToggle = async (meal: Meal) => {
    if (!isLoggedIn) {
      router.push('/(auth)/customer-login');
      return;
    }

    try {
      const isFavorite = favoriteMealIds.has(meal.id);
      
      if (isFavorite) {
        // Remove from favorites
        const response = await removeMealFromFavorites(meal.id);
        if (response.success) {
          const newFavorites = new Set(favoriteMealIds);
          newFavorites.delete(meal.id);
          setFavoriteMealIds(newFavorites);
          
          // Update meals state
          setMeals(prevMeals => 
            prevMeals.map(m => 
              m.id === meal.id ? { ...m, isFavorite: false } : m
            )
          );
          
          setToastVisible(true);
          setToastMessage(`${meal.name} removed from favorites`);
          setToastType('success');
        }
      } else {
        // Add to favorites
        const response = await addMealToFavorites(meal.id);
        if (response.success) {
          const newFavorites = new Set(favoriteMealIds);
          newFavorites.add(meal.id);
          setFavoriteMealIds(newFavorites);
          
          // Update meals state
          setMeals(prevMeals => 
            prevMeals.map(m => 
              m.id === meal.id ? { ...m, isFavorite: true } : m
            )
          );
          
          setToastVisible(true);
          setToastMessage(`${meal.name} added to favorites`);
          setToastType('success');
        }
      }
    } catch (error) {
      console.error('❌ Error toggling favorite:', error);
      setToastVisible(true);
      setToastMessage('Failed to update favorites. Please try again.');
      setToastType('error');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f7f5f0" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lunch</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Personalization Status */}
        {personalizationInfo.isPersonalized && (
          <View style={styles.personalizationBanner}>
            <Text style={styles.personalizationText}>
              {personalizationInfo.summary}
            </Text>
          </View>
        )}

        {/* Sort Section */}
        <View style={styles.sortContainer}>
          <Text style={styles.sortLabel}>Sort by</Text>
          <TouchableOpacity style={styles.sortSelector}>
            <Text style={styles.sortText}>{selectedSort}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Meal Cards */}
        <View style={styles.mealsList}>
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            meals.map((meal) => (
              <View key={meal.id} style={styles.mealCard}>
                {/* Horizontal Layout: Image | Content | Heart */}
            <TouchableOpacity
                  style={styles.mealContent}
              onPress={() => handleMealPress(meal)}
              activeOpacity={0.95}
            >
                {/* Image on the left */}
                <Image source={meal.image} style={styles.mealImage} />
                
                  {/* Content in the middle */}
                <View style={styles.mealInfo}>
                  <Text style={styles.mealName}>{meal.name}</Text>
                  <Text style={styles.mealDescription}>{meal.description}</Text>
                  
                  <View style={styles.caloriesContainer}>
                    <Ionicons name="time-outline" size={14} color="#666" />
                    <Text style={styles.caloriesText}>{meal.calories}</Text>
                  </View>
                  
                  <View style={styles.tagsContainer}>
                    {meal.tags.map((tag, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                  
                  <View style={styles.actionButtons}>
                    <TouchableOpacity 
                      style={styles.orderButton}
                      onPress={() => handleOrder(meal)}
                    >
                      <Text style={styles.orderButtonText}>Order</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.addToPlanButton}
                      onPress={() => handleAddToPlan(meal)}
                    >
                      <Text style={styles.addToPlanButtonText}>Add to Plan</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                </TouchableOpacity>
                
                {/* Heart icon on the right */}
                <TouchableOpacity 
                  style={styles.heartButton}
                  onPress={() => handleFavoriteToggle(meal)}
                >
                  <Ionicons 
                    name={meal.isFavorite ? "heart" : "heart-outline"} 
                    size={24} 
                    color={meal.isFavorite ? "#ff4444" : "#666"} 
                  />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Load More Section */}
        <View style={styles.loadMoreSection}>
          <Text style={styles.showingText}>Showing {meals.length} of {meals.length} results</Text>
          <TouchableOpacity style={styles.loadMoreButton}>
            <Text style={styles.loadMoreText}>Load more</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Toast Component */}
      <NotificationToast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
        actionText={toastType === 'cart' ? 'View Cart' : undefined}
        onActionPress={toastType === 'cart' ? () => router.push('/(customer-tabs)/order') : undefined}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f5f0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#f7f5f0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  sortContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sortLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  sortSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  mealsList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  mealCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  mealContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heartButton: {
    padding: 8,
    marginLeft: 8,
  },
  mealImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  mealInfo: {
    flex: 1,
    gap: 6,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  mealDescription: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  caloriesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  caloriesText: {
    fontSize: 12,
    color: '#6b7280',
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginTop: 4,
  },
  tag: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  orderButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  orderButtonText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  addToPlanButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  addToPlanButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  loadMoreSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
    gap: 8,
  },
  showingText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  loadMoreButton: {
    marginTop: 4,
  },
  loadMoreText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  personalizationBanner: {
    padding: 16,
    backgroundColor: colors.primary,
    borderRadius: 12,
    marginBottom: 24,
  },
  personalizationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
});