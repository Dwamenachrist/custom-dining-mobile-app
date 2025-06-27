import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, StatusBar, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '../theme/colors';
import { Button } from '../components/Button';
import { getHybridMealsByRestaurant, getHybridRestaurants } from '../services/hybridMealService';

const { width: screenWidth } = Dimensions.get('window');

export default function RestaurantProfileScreen() {
  const router = useRouter();
  const { id, name, rating, reviewCount, imageSource, tags, distance, deliveryTime } = useLocalSearchParams();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [meals, setMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRestaurantData();
  }, [id]);

  const fetchRestaurantData = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🏪 Setting up restaurant data from params and fetching meals...');
      
      // Use passed restaurant data
      const restaurantData = {
        id: id as string,
        name: name as string || 'Restaurant',
        rating: parseFloat(rating as string) || 4.5,
        reviewCount: parseInt(reviewCount as string) || 100,
        image: imageSource ? JSON.parse(imageSource as string) : require('../assets/restaurant-logo.png'),
        coverImage: imageSource ? JSON.parse(imageSource as string) : require('../assets/restaurant-logo.png'),
        tags: tags ? JSON.parse(tags as string) : ['Restaurant'],
        distance: distance as string || '2.0 km',
        deliveryTime: deliveryTime as string || '25 - 35 min',
        address: `${distance || '2.0 km'} away • ${deliveryTime || '25-35 min'} delivery`
      };
      
      setRestaurant(restaurantData);
      
      // Fetch meals for this restaurant from hybrid service
      const mealsResponse = await getHybridMealsByRestaurant(id as string);
      
      if (mealsResponse.success && mealsResponse.data) {
        // Convert meals to display format
        const displayMeals = mealsResponse.data.slice(0, 6).map((meal: any) => ({
          id: meal.id,
          name: meal.name,
          description: meal.description,
          image: meal.image || require('../assets/recommendation1.png'),
          price: parseFloat(meal.price) || 3000,
          calories: meal.nutritionalInfo?.calories || 400,
          tags: meal.dietaryTags || []
        }));
        setMeals(displayMeals);
      } else {
        // Fallback meals if none found for restaurant
        setMeals([
          {
            id: 'fallback-1',
            name: 'Signature Dish',
            description: 'Our chef\'s special recommendation',
            image: require('../assets/recommendation1.png'),
            price: 3500,
            calories: 450,
            tags: ['Popular', 'Chef Special']
          },
          {
            id: 'fallback-2',
            name: 'Healthy Bowl',
            description: 'Nutritious and delicious meal bowl',
            image: require('../assets/recommendation2.png'),
            price: 2800,
            calories: 380,
            tags: ['Healthy', 'Fresh']
          }
        ]);
      }
      
      console.log('✅ Restaurant profile data loaded!');
    } catch (err: any) {
      console.error('❌ Error setting up restaurant data:', err);
      setError('Failed to load restaurant data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading restaurant...</Text>
      </View>
    );
  }

  if (error || !restaurant) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Restaurant not found'}</Text>
        <Button
          title="Go Back"
          variant="primary"
          onPress={() => router.back()}
        />
      </View>
    );
  }

  const handleViewMenu = () => {
    console.log('Navigate to full menu');
  };

  const handleStartOrder = () => {
    console.log('Start order');
  };

  const handleAddToPlan = (meal: any) => {
    console.log('Add to plan:', meal.name);
  };

  const handleMealPress = (meal: any) => {
    router.push(`/meal/${meal.id}?name=${encodeURIComponent(meal.name)}&description=${encodeURIComponent(meal.description)}&price=${meal.price}&calories=${meal.calories}&image=${encodeURIComponent(JSON.stringify(meal.image))}`);
  };

  const handleSeeAllReviews = () => {
    router.push(`/reviews?itemName=${encodeURIComponent(restaurant?.name || 'Restaurant')}`);
  };

  const handleSeeAllPopular = () => {
    console.log('See all popular meals');
  };

  const truncateDescription = (description: string, maxWords: number = 8) => {
    const words = description.split(' ');
    if (words.length <= maxWords) return description;
    return words.slice(0, maxWords).join(' ') + '...';
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Step 1: Image Background - 390x324 from status bar */}
      <View style={styles.imageContainer}>
        <Image source={restaurant.coverImage} style={styles.backgroundImage} />
        
        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        {/* Header Title */}
        <Text style={styles.headerTitle}>Restaurant profile</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Step 2: Nice Space/Margin before restaurant info */}
        <View style={styles.contentSpacing} />
        
        {/* Step 3: Restaurant Information */}
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>
          <Text style={styles.restaurantAddress}>{restaurant.address}</Text>
          
          {/* Tags */}
          <View style={styles.tagsContainer}>
            {restaurant.tags.map((tag: string, index: number) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
          
          {/* Rating with See all */}
          <View style={styles.ratingContainer}>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= Math.floor(restaurant.rating) ? "star" : star <= restaurant.rating ? "star-half" : "star-outline"}
                  size={20}
                  color="#FFD700"
                />
              ))}
              <Text style={styles.ratingText}>({restaurant.reviewCount})</Text>
            </View>
            <TouchableOpacity onPress={handleSeeAllReviews}>
              <Text style={styles.seeAllLink}>See all</Text>
            </TouchableOpacity>
          </View>
          
          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Button
              title="View Menu"
              variant="primary"
              onPress={handleViewMenu}
              style={styles.actionButton}
            />
            <Button
              title="Reviews"
              variant="outline"
              onPress={handleSeeAllReviews}
              style={styles.actionButton}
            />
            <Button
              title="Start Order"
              variant="outline"
              onPress={handleStartOrder}
              style={styles.actionButton}
            />
          </View>
        </View>
        
        {/* Step 4: Most Popular Section - Simple Clean Layout */}
        <View style={styles.popularSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Most Popular</Text>
            <TouchableOpacity onPress={handleSeeAllPopular}>
              <Text style={styles.seeAllLink}>See all</Text>
            </TouchableOpacity>
          </View>
          
          {/* Simple grid of meals */}
          <View style={styles.mealsGrid}>
            {meals.map((meal) => (
              <TouchableOpacity 
                key={meal.id} 
                style={styles.mealCard}
                onPress={() => handleMealPress(meal)}
                activeOpacity={0.8}
              >
                <Image source={meal.image} style={styles.mealImage} />
                <Text style={styles.mealName}>{meal.name}</Text>
                <Text style={styles.mealDescription}>{truncateDescription(meal.description)}</Text>
                <TouchableOpacity 
                  onPress={(e) => {
                    e.stopPropagation();
                    handleAddToPlan(meal);
                  }}
                  style={styles.addToPlanButtonContainer}
                >
                  <Button
                    title="Add to Plan"
                    variant="primary"
                    style={styles.addToPlanButton}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f5f0',
  },
  
  // Step 1: Image Background - 390x324
  imageContainer: {
    width: screenWidth,
    height: 324,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    position: 'absolute',
    top: 55,
    left: 80,
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  
  scrollView: {
    flex: 1,
  },
  
  // Step 2: Nice spacing before content
  contentSpacing: {
    height: 24,
  },
  
  // Step 3: Restaurant Information
  restaurantInfo: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  restaurantAddress: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  seeAllLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    minWidth: 100,
  },
  
  // Step 4: Most Popular - Simple Clean Layout
  popularSection: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  mealsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  mealCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  mealImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  mealName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 12,
    marginHorizontal: 12,
    marginBottom: 4,
  },
  mealDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginHorizontal: 12,
    marginBottom: 12,
    lineHeight: 16,
  },
  addToPlanButton: {
    marginHorizontal: 12,
    marginBottom: 12,
    paddingVertical: 8,
  },
  addToPlanButtonContainer: {
    marginHorizontal: 12,
    marginBottom: 12,
  },
  
  bottomSpacing: {
    height: 40,
  },
  
  // Loading and Error states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f5f0',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f5f0',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 20,
  },
});