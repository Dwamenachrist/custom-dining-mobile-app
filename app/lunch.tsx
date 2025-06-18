import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '../theme/colors';
import { useAuth } from '../auth-context';

interface Meal {
  id: string;
  name: string;
  description: string;
  image: any;
  tags: string[];
  calories: string;
  rating: number;
  price: number;
}

const LUNCH_MEALS: Meal[] = [
  {
    id: '1',
    name: 'Grilled Chicken Salad',
    description: 'Fresh mixed greens with perfectly grilled chicken breast',
    image: require('../assets/recommendation1.png'),
    tags: ['High Protein', 'Low-Carb'],
    calories: '420 Cal Per Serving',
    rating: 4.8,
    price: 2500
  },
  {
    id: '2',
    name: 'Quinoa Power Bowl',
    description: 'Nutritious quinoa bowl with roasted vegetables and tahini',
    image: require('../assets/recommendation2.png'),
    tags: ['Vegan', 'High Fiber'],
    calories: '380 Cal Per Serving',
    rating: 4.6,
    price: 2200
  },
  {
    id: '3',
    name: 'Turkey Wrap',
    description: 'Whole wheat wrap filled with lean turkey and fresh veggies',
    image: require('../assets/recommendation3.png'),
    tags: ['High Protein', 'Balanced'],
    calories: '450 Cal Per Serving',
    rating: 4.7,
    price: 2000
  },
  {
    id: '4',
    name: 'Mediterranean Bowl',
    description: 'Fresh bowl with hummus, olives, cucumber and feta cheese',
    image: require('../assets/recommendation1.png'),
    tags: ['Mediterranean', 'Vegetarian'],
    calories: '390 Cal Per Serving',
    rating: 4.5,
    price: 2300
  },
  {
    id: '5',
    name: 'Asian Stir Fry',
    description: 'Colorful vegetables stir-fried with tofu in savory sauce',
    image: require('../assets/recommendation2.png'),
    tags: ['Vegan', 'Asian'],
    calories: '360 Cal Per Serving',
    rating: 4.9,
    price: 2100
  },
  {
    id: '6',
    name: 'Salmon & Rice',
    description: 'Grilled salmon served with brown rice and steamed broccoli',
    image: require('../assets/recommendation3.png'),
    tags: ['High Protein', 'Omega-3'],
    calories: '520 Cal Per Serving',
    rating: 4.8,
    price: 2800
  }
];

export default function LunchScreen() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [selectedSort, setSelectedSort] = useState('Most Popular');

  const handleMealPress = (meal: Meal) => {
    router.push({
      pathname: '/meal/[id]',
      params: { 
        id: meal.id,
        name: meal.name,
        description: meal.description,
        price: meal.price.toString(),
        calories: meal.calories,
        tags: JSON.stringify(meal.tags)
      }
    });
  };

  const handleAddToPlan = (meal: Meal) => {
    if (!isLoggedIn) {
      router.push('/(auth)/customer-login');
      return;
    }
    console.log('Adding to plan:', meal.name);
  };

  const handleOrder = (meal: Meal) => {
    if (!isLoggedIn) {
      router.push('/(auth)/customer-login');
      return;
    }
    console.log('Ordering:', meal.name);
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
          {LUNCH_MEALS.map((meal) => (
            <TouchableOpacity
              key={meal.id}
              style={styles.mealCard}
              onPress={() => handleMealPress(meal)}
              activeOpacity={0.95}
            >
              <TouchableOpacity 
                style={styles.heartButton}
                onPress={() => console.log('Heart pressed')}
              >
                <Ionicons name="heart-outline" size={20} color="#666" />
              </TouchableOpacity>
              
              {/* Card Content - Horizontal Layout */}
              <View style={styles.cardContent}>
                {/* Image on the left */}
                <Image source={meal.image} style={styles.mealImage} />
                
                {/* Content on the right */}
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
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Load More Section */}
        <View style={styles.loadMoreSection}>
          <Text style={styles.showingText}>Showing 6 of 20 results</Text>
          <TouchableOpacity style={styles.loadMoreButton}>
            <Text style={styles.loadMoreText}>Load more</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  heartButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 4,
  },
  cardContent: {
    flexDirection: 'row',
    gap: 12,
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
}); 