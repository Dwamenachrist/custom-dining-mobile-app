import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '../theme/colors';
import { useAuth } from '../auth-context';
import { useCart } from '../cart-context';
import MealPlanService from '../services/mealPlanService';
import MealPlanToast from '../components/MealPlanToast';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Restaurant {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  image: any;
  tags: string[];
  distance: string;
  deliveryTime: string;
  description?: string;
}

interface Meal {
  id: string;
  name: string;
  description: string;
  image: any;
  price: number;
  tags: string[];
  calories: string;
}

export default function RestaurantProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { isLoggedIn } = useAuth();
  const { addToCart } = useCart();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [error, setError] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'cart'>('success');

  // Sample menu items for the restaurant
  const menuItems: Meal[] = [
    {
      id: '1',
      name: 'Fruity Oats',
      description: 'Delicious oats with fresh fruits',
      image: require('../assets/meals/Fruity Oats delight.png'),
      price: 3000,
      tags: ['Healthy', 'Breakfast'],
      calories: '310 Cal'
    },
    {
      id: '2',
      name: 'Avocado Veggie Bowl',
      description: 'Fresh avocado with mixed vegetables',
      image: require('../assets/meals/Avocado Veggie Bowl.png'),
      price: 4000,
      tags: ['Vegan', 'Healthy'],
      calories: '280 Cal'
    },
    {
      id: '3',
      name: 'Grilled Chicken',
      description: 'Perfectly grilled chicken with spices',
      image: require('../assets/meals/Grilled Fish and Veggies.png'),
      price: 6000,
      tags: ['Protein', 'Grilled'],
      calories: '420 Cal'
    }
  ];

  useEffect(() => {
    // Parse restaurant data from params
    try {
      const restaurantData: Restaurant = {
        id: params.id as string || '1',
        name: params.name as string || 'GreenChef Kitchen',
        rating: parseFloat(params.rating as string) || 4.8,
        reviewCount: parseInt(params.reviewCount as string) || 120,
        image: params.imageSource ? JSON.parse(params.imageSource as string) : require('../assets/restaurants/Green Chef Kitchen.png'),
        tags: params.tags ? JSON.parse(params.tags as string) : ['Vegan Friendly', 'Organic Focused', 'Plant-Based'],
        distance: params.distance as string || '2.0 km',
        deliveryTime: params.deliveryTime as string || '25-35 min',
        description: 'Fresh, organic meals prepared with love and care for your health'
      };
      setRestaurant(restaurantData);
    } catch (err) {
      console.error('Error parsing restaurant data:', err);
      setError('Failed to load restaurant information');
    }
  }, [params]);

  const handleOrder = (meal: Meal) => {
    if (!isLoggedIn) {
      router.push('/(auth)/customer-login');
      return;
    }
    
    addToCart({
      id: meal.id,
      name: meal.name,
      price: meal.price,
      image: meal.image,
      restaurant: restaurant?.name || 'Restaurant'
    });
    
    setToastVisible(true);
    setToastMessage(`${meal.name} added to cart!`);
    setToastType('cart');
  };

  const handleAddToPlan = async (meal: Meal) => {
    if (!isLoggedIn) {
      router.push('/(auth)/customer-login');
      return;
    }
    
    try {
      const result = await MealPlanService.addMealToPlan({
        id: meal.id,
        name: meal.name,
        description: meal.description,
        image: meal.image,
        tags: meal.tags,
        calories: meal.calories,
        price: meal.price,
        restaurant: restaurant?.name
      });
      
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
      console.error('Error adding meal to plan:', error);
      setToastVisible(true);
      setToastMessage('Failed to add meal to plan. Please try again.');
      setToastType('error');
    }
  };

  const handleViewMenu = () => {
    router.push('/menu');
  };

  const handleStartOrder = () => {
    router.push('/(customer-tabs)/order');
  };

  const handleSeeAllReviews = () => {
    router.push(`/reviews?itemName=${encodeURIComponent(restaurant?.name || 'Restaurant')}`);
  };

  if (error || !restaurant) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Restaurant not found'}</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header Image */}
      <View style={styles.imageContainer}>
        <Image source={restaurant.image} style={styles.backgroundImage} />
        
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        {/* Profile Text */}
        <Text style={styles.profileText}>Profile</Text>
        
        {/* Edit Button */}
        <TouchableOpacity style={styles.editButton}>
          <Ionicons name="create-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Restaurant Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>
          
          {/* Tags */}
          <View style={styles.tagsContainer}>
            {restaurant.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
          
          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.statText}>{restaurant.rating}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="people" size={16} color={colors.darkGray} />
              <Text style={styles.statText}>{restaurant.reviewCount}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time" size={16} color={colors.darkGray} />
              <Text style={styles.statText}>{restaurant.deliveryTime}</Text>
            </View>
          </View>
          
          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={handleViewMenu}>
              <Text style={styles.actionButtonText}>View Menu</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]} onPress={handleSeeAllReviews}>
              <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>Reviews</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]} onPress={handleStartOrder}>
              <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>Start Order</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Your Menu Section */}
        <View style={styles.menuSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Menu</Text>
            <TouchableOpacity onPress={handleViewMenu}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          
          {/* Menu Items Grid */}
          <View style={styles.menuGrid}>
            {menuItems.map((meal) => (
              <View key={meal.id} style={styles.menuCard}>
                <Image source={meal.image} style={styles.menuItemImage} />
                <Text style={styles.menuItemName}>{meal.name}</Text>
                <Text style={styles.menuItemPrice}>{meal.price.toLocaleString()}</Text>
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => handleAddToPlan(meal)}
                >
                  <Ionicons name="add" size={16} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
        
        {/* Reviews Section */}
        <View style={styles.reviewsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <TouchableOpacity onPress={handleSeeAllReviews}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          
          {/* Sample Reviews */}
          <View style={styles.reviewCard}>
            <Text style={styles.reviewerName}>Vivian Eze</Text>
            <View style={styles.reviewStars}>
              {[1,2,3,4,5].map((star) => (
                <Ionicons key={star} name="star" size={14} color="#FFD700" />
              ))}
            </View>
            <Text style={styles.reviewText}>Great food and fast delivery! The oats were delicious and fresh. Highly recommend!</Text>
          </View>
          
          <View style={styles.reviewCard}>
            <Text style={styles.reviewerName}>Victor Adewale</Text>
            <View style={styles.reviewStars}>
              {[1,2,3,4,5].map((star) => (
                <Ionicons key={star} name="star" size={14} color="#FFD700" />
              ))}
            </View>
            <Text style={styles.reviewText}>Amazing healthy options! Perfect for my diet plan. Will definitely order again.</Text>
          </View>
        </View>
      </ScrollView>
      
      {/* Toast Component */}
      <MealPlanToast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
        actionText={toastType === 'cart' ? 'View Cart' : undefined}
        onActionPress={toastType === 'cart' ? () => router.push('/(customer-tabs)/order') : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f5f0',
  },
  imageContainer: {
    height: 250,
    position: 'relative',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: 8,
  },
  profileText: {
    position: 'absolute',
    top: 58,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  editButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: 8,
  },
  scrollView: {
    flex: 1,
    marginTop: -20,
  },
  infoCard: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: colors.darkGray,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: colors.primary,
  },
  menuSection: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
  },
  seeAllText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  menuCard: {
    width: (SCREEN_WIDTH - 64) / 3,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    position: 'relative',
  },
  menuItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginBottom: 8,
  },
  menuItemName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.black,
    textAlign: 'center',
    marginBottom: 4,
  },
  menuItemPrice: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  addButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 4,
  },
  reviewsSection: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 20,
  },
  reviewCard: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 4,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 8,
  },
  reviewText: {
    fontSize: 13,
    color: colors.darkGray,
    lineHeight: 18,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.darkGray,
    textAlign: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
