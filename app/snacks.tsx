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

const SNACK_MEALS: Meal[] = [
  {
    id: '1',
    name: 'Mixed Nuts Bowl',
    description: 'Assorted roasted nuts with a hint of sea salt',
    image: require('../assets/recommendation1.png'),
    tags: ['High Protein', 'Healthy Fats'],
    calories: '280 Cal Per Serving',
    rating: 4.7,
    price: 800
  },
  {
    id: '2',
    name: 'Greek Yogurt Parfait',
    description: 'Creamy Greek yogurt layered with fresh berries and granola',
    image: require('../assets/recommendation2.png'),
    tags: ['High Protein', 'Probiotics'],
    calories: '220 Cal Per Serving',
    rating: 4.8,
    price: 1200
  },
  {
    id: '3',
    name: 'Veggie Hummus Plate',
    description: 'Fresh cut vegetables served with homemade hummus',
    image: require('../assets/recommendation3.png'),
    tags: ['Vegan', 'High Fiber'],
    calories: '180 Cal Per Serving',
    rating: 4.6,
    price: 900
  },
  {
    id: '4',
    name: 'Apple Slices & Almond Butter',
    description: 'Crisp apple slices paired with natural almond butter',
    image: require('../assets/recommendation1.png'),
    tags: ['Natural', 'Quick'],
    calories: '250 Cal Per Serving',
    rating: 4.5,
    price: 700
  },
  {
    id: '5',
    name: 'Energy Balls',
    description: 'Date and oat energy balls rolled in coconut',
    image: require('../assets/recommendation2.png'),
    tags: ['Natural', 'Energy Boost'],
    calories: '160 Cal Per Serving',
    rating: 4.9,
    price: 600
  },
  {
    id: '6',
    name: 'Cheese & Crackers',
    description: 'Whole grain crackers with aged cheese selection',
    image: require('../assets/recommendation3.png'),
    tags: ['Balanced', 'Satisfying'],
    calories: '320 Cal Per Serving',
    rating: 4.4,
    price: 1000
  }
];

export default function SnacksScreen() {
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
        <Text style={styles.headerTitle}>Snacks</Text>
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
          {SNACK_MEALS.map((meal) => (
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
  cardContent: {
    flexDirection: 'row',
    gap: 12,
  },
});
