import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '../theme/colors';
import { useAuth } from '../auth-context';
import { Button } from '../components/Button';
import { getHybridRestaurants } from '../services/hybridMealService';

interface Restaurant {
  id: string;
  name: string;
  image: any;
  tags: string[];
  distance: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
}

const FILTER_TAGS = ['Low-Carb', 'Sugar-Free', 'Vegan Friendly', 'Diabetic-Friendly'];
const SORT_OPTIONS = ['Recommended', 'Top Rated', 'Near You', 'Recent'];

// Convert hybrid restaurant to display format
const convertHybridRestaurant = (hybridRestaurant: any): Restaurant => {
  return {
    id: hybridRestaurant.restaurantId,
    name: hybridRestaurant.restaurantName,
    image: hybridRestaurant.image,
    tags: [hybridRestaurant.cuisineType || 'Restaurant'],
    distance: '2.0 km', // Default since backend doesn't provide
    rating: hybridRestaurant.rating || 4.5,
    reviewCount: hybridRestaurant.reviewCount || 100,
    deliveryTime: hybridRestaurant.deliveryTime || '25-35 min'
  };
};

export default function RestaurantsListScreen() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [activeSortOption, setActiveSortOption] = useState('Recommended');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
  const [showMore, setShowMore] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRestaurants();
  }, []);

  useEffect(() => {
    filterRestaurants();
  }, [searchQuery, activeFilters, activeSortOption, allRestaurants]);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      console.log('🌐 Loading restaurants from hybrid service...');
      
      const response = await getHybridRestaurants();
      
      if (response.success && response.data && response.data.length > 0) {
        console.log('✅ Loaded restaurants from hybrid service!');
        const convertedRestaurants = response.data.map(convertHybridRestaurant);
        setAllRestaurants(convertedRestaurants);
      } else {
        console.log('⚠️ No restaurants available from hybrid service');
        setAllRestaurants([]);
      }
    } catch (error) {
      console.error('❌ Error loading restaurants:', error);
      setAllRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  const filterRestaurants = () => {
    let filtered = allRestaurants;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(restaurant =>
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply tag filters
    if (activeFilters.length > 0) {
      filtered = filtered.filter(restaurant =>
        restaurant.tags.some(tag => activeFilters.includes(tag))
      );
    }

    // Apply sorting
    switch (activeSortOption) {
      case 'Top Rated':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'Near You':
        filtered.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
        break;
      case 'Recent':
        // Keep original order for recent
        break;
      default: // Recommended
        filtered.sort((a, b) => b.reviewCount - a.reviewCount);
    }

    setRestaurants(filtered);
  };

  const handleFilterToggle = (filter: string) => {
    setActiveFilters(prev =>
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  };

  const handleRestaurantPress = (restaurant: Restaurant) => {
    // Navigate to restaurant profile with complete data
    console.log('Navigate to restaurant:', restaurant.name);
    router.push({
      pathname: '/restaurant-profile',
      params: {
        id: restaurant.id,
        name: restaurant.name,
        rating: restaurant.rating.toString(),
        reviewCount: restaurant.reviewCount.toString(),
        imageSource: JSON.stringify(restaurant.image),
        tags: JSON.stringify(restaurant.tags),
        distance: restaurant.distance,
        deliveryTime: restaurant.deliveryTime
      }
    });
  };

  const displayedRestaurants = showMore ? restaurants : restaurants.slice(0, 4);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#f7f5f0" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Explore Restaurants</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Search Bar - Fixed padding */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#6b7280" />
            <TextInput
              placeholder="Search for meals, restaurants..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              placeholderTextColor="#6b7280"
            />
            <TouchableOpacity style={styles.filterIcon}>
              <Ionicons name="options" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Tags */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {FILTER_TAGS.map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => handleFilterToggle(filter)}
              style={[
                styles.filterChip,
                activeFilters.includes(filter) && styles.filterChipActive
              ]}
            >
              <Text style={[
                styles.filterChipText,
                activeFilters.includes(filter) && styles.filterChipTextActive
              ]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Sort Options */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.sortContainer}
          contentContainerStyle={styles.sortContent}
        >
          {SORT_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option}
              onPress={() => setActiveSortOption(option)}
              style={[
                styles.sortChip,
                activeSortOption === option && styles.sortChipActive
              ]}
            >
              <Text style={[
                styles.sortChipText,
                activeSortOption === option && styles.sortChipTextActive
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Restaurant List - Improved Layout */}
        <View style={styles.restaurantList}>
          {displayedRestaurants.map((restaurant) => (
            <TouchableOpacity
              key={restaurant.id}
              style={styles.restaurantCard}
              onPress={() => handleRestaurantPress(restaurant)}
              activeOpacity={0.95}
            >
              <View style={styles.glassCard}>
                <Image source={restaurant.image} style={styles.restaurantImage} />
                <View style={styles.restaurantInfo}>
                  <Text style={styles.restaurantName}>{restaurant.name}</Text>
                  
                  {/* Tags */}
                  <View style={styles.tagsContainer}>
                    {restaurant.tags.slice(0, 2).map((tag, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                
                {/* Improved View Button using your Button component */}
                <View style={styles.buttonContainer}>
                  <Button
                    title="View"
                    variant="primary"
                    onPress={() => handleRestaurantPress(restaurant)}
                    style={styles.viewButton}
                  />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Beautiful Load More Button */}
        {!showMore && restaurants.length > 4 && (
          <View style={styles.loadMoreContainer}>
            <Button
              title="Load More Restaurants"
              variant="outline"
              onPress={() => setShowMore(true)}
              style={styles.loadMoreButton}
            />
          </View>
        )}
        
        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f5f0',
    marginTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#f7f5f0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  scrollView: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8, // Reduced from 12 to 8
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1a1a1a',
  },
  filterIcon: {
    padding: 4,
  },
  filterContainer: {
    marginBottom: 12,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  filterChipTextActive: {
    color: '#fff',
  },
  sortContainer: {
    marginBottom: 20,
  },
  sortContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  sortChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(107, 114, 128, 0.3)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
  },
  sortChipActive: {
    backgroundColor: '#6b7280',
    borderColor: '#6b7280',
  },
  sortChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  sortChipTextActive: {
    color: '#fff',
  },
  restaurantList: {
    paddingHorizontal: 16,
  },
  restaurantCard: {
    marginBottom: 16,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start', // Changed to flex-start for better alignment
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  restaurantImage: {
    width: 64,
    height: 64,
    borderRadius: 16,
    marginRight: 16,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2f7d52',
    marginBottom: 4,
  },
  restaurantDistance: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
    gap: 4,
  },
  tag: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  buttonContainer: {
    marginTop: -10,
  },
  viewButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 20,
  },
  loadMoreContainer: {
    padding: 16,
    alignItems: 'center',
  },
  loadMoreButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 12,
    padding: 16,
  },
  bottomSpacing: {
    height: 20,
  },
});
