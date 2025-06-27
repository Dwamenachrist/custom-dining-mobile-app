import React, { useState, useEffect } from 'react';
import { View, Text, TextInput as RNTextInput, TouchableOpacity, ScrollView, Image, StatusBar, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { Button } from '../../components/Button';
import { useRouter } from 'expo-router';
import { useAuth } from '../../auth-context';
import api from '../../services/api';
import { getAssetFromMapping } from '../../services/assetMapping';

interface Meal {
  id: string;
  type: 'meal';
  name: string;
  description: string;
  image: any;
  tags: string[];
  calories?: number;
  price?: number;
  restaurant?: string;
}

interface Restaurant {
  id: string;
  type: 'restaurant';
  name: string;
  image: any;
  tags: string[];
  distance: string;
  rating?: number;
  reviewCount?: number;
}

type SearchItem = Meal | Restaurant;

const FILTERS = ['Healthy', 'Vegetarian', 'Vegan', 'Gluten-Free', 'High-Protein', 'Low-Carb'];

export default function RestaurantSearchScreen() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'Meals' | 'Restaurants'>('Meals');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [allMeals, setAllMeals] = useState<Meal[]>([]);
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (search.trim()) {
        handleSearch();
      } else {
        setShowResults(false);
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search, activeFilters, activeTab]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      
      // Load meals from restaurant
      const restaurantId = user?.restaurantId || '683c5e59a91c66e8f9486c17';
      const mealsResponse = await api.get(`/meals/restaurant/${restaurantId}`);
      
      if (mealsResponse.success && mealsResponse.data) {
        const convertedMeals = (mealsResponse.data as any[]).map((meal: any) => ({
          id: meal._id || meal.id,
          type: 'meal' as const,
          name: meal.name,
          description: meal.description,
          image: getAssetFromMapping(meal.name) || require('../../assets/meals/Basmati Jollof Rice.png'),
          tags: meal.dietaryTags || [],
          price: typeof meal.price === 'string' ? parseFloat(meal.price) : meal.price,
          calories: Math.floor(Math.random() * 200) + 300,
          restaurant: 'Your Restaurant'
        }));
        setAllMeals(convertedMeals);
      } else {
        // Sample meals if no backend data
        const sampleMeals: Meal[] = [
          {
            id: '1',
            type: 'meal',
            name: 'Basmati Jollof Rice',
            description: 'Premium basmati rice with spices',
            image: require('../../assets/meals/Basmati Jollof Rice.png'),
            tags: ['Traditional', 'Gluten-Free'],
            price: 8500,
            calories: 520,
            restaurant: 'Your Restaurant'
          },
          {
            id: '2',
            type: 'meal',
            name: 'Fruity Oats Delight',
            description: 'Healthy oats with fresh fruits',
            image: require('../../assets/meals/Fruity Oats delight.png'),
            tags: ['Healthy', 'Vegetarian'],
            price: 5000,
            calories: 310,
            restaurant: 'Your Restaurant'
          },
          {
            id: '3',
            type: 'meal',
            name: 'Grilled Fish & Veggies',
            description: 'Fresh grilled fish with vegetables',
            image: require('../../assets/meals/Grilled Fish and Veggies.png'),
            tags: ['High-Protein', 'Healthy'],
            price: 9500,
            calories: 420,
            restaurant: 'Your Restaurant'
          }
        ];
        setAllMeals(sampleMeals);
      }
      
      // Sample restaurants for comparison
      const sampleRestaurants: Restaurant[] = [
        {
          id: '1',
          type: 'restaurant',
          name: 'Green Chef Kitchen',
          image: require('../../assets/restaurants/Green Chef Kitchen.png'),
          tags: ['Vegan', 'Organic'],
          distance: '1.2 km away',
          rating: 4.8,
          reviewCount: 120
        },
        {
          id: '2',
          type: 'restaurant',
          name: 'Health n Healthy',
          image: require('../../assets/restaurants/Health n Healthy.png'),
          tags: ['Healthy', 'Fresh'],
          distance: '2.1 km away',
          rating: 4.6,
          reviewCount: 89
        },
        {
          id: '3',
          type: 'restaurant',
          name: 'NOK By Alara',
          image: require('../../assets/restaurants/NOK By Alara.png'),
          tags: ['Traditional', 'Local'],
          distance: '1.8 km away',
          rating: 4.7,
          reviewCount: 156
        }
      ];
      setAllRestaurants(sampleRestaurants);
      
    } catch (error) {
      console.error(' Error loading search data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterItems = (items: SearchItem[]) => {
    if (activeFilters.length === 0) return items;
    return items.filter(item => 
      item.tags.some(tag => 
        activeFilters.some(filter => 
          tag.toLowerCase().includes(filter.toLowerCase())
        )
      )
    );
  };

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const query = search.toLowerCase();
      let results: SearchItem[] = [];
      
      if (activeTab === 'Meals') {
        results = allMeals.filter(meal =>
          meal.name.toLowerCase().includes(query) ||
          meal.description.toLowerCase().includes(query) ||
          meal.tags.some(tag => tag.toLowerCase().includes(query))
        );
      } else {
        results = allRestaurants.filter(restaurant =>
          restaurant.name.toLowerCase().includes(query) ||
          restaurant.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }
      
      const filteredResults = filterItems(results);
      setSearchResults(filteredResults);
      setShowResults(true);
      
      console.log(` Search results: ${filteredResults.length} ${activeTab.toLowerCase()}`);
      
    } catch (error) {
      console.error(' Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterToggle = (filter: string) => {
    setActiveFilters(prev =>
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  };

  const handleEditMeal = (meal: Meal) => {
    router.push({
      pathname: '/add-meal',
      params: {
        editMode: 'true',
        itemId: meal.id,
        itemName: meal.name,
        itemDescription: meal.description,
        itemPrice: meal.price?.toString() || '0',
        itemTags: JSON.stringify(meal.tags)
      }
    });
  };

  const handleViewRestaurant = (restaurant: Restaurant) => {
    router.push({
      pathname: '/restaurant-profile',
      params: {
        id: restaurant.id,
        name: restaurant.name,
        rating: restaurant.rating?.toString() || '4.5',
        reviewCount: restaurant.reviewCount?.toString() || '100',
        imageSource: JSON.stringify(restaurant.image),
        tags: JSON.stringify(restaurant.tags),
        distance: restaurant.distance,
        deliveryTime: '25-35 min'
      }
    });
  };

  const handleBack = () => {
    router.back();
  };

  const renderItem = (item: SearchItem) => (
    <View key={item.id} style={{
      backgroundColor: colors.white,
      borderRadius: 16,
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 1
    }}>
      <Image source={item.image} style={{ width: 56, height: 56, borderRadius: 12, marginRight: 12 }} />
      <View style={{ flex: 1 }}>
        <Text style={{
          fontWeight: '700',
          fontSize: 15,
          color: colors.primary,
          marginBottom: 2
        }}>
          {item.name}
        </Text>
        
        {item.type === 'meal' && (
          <Text style={{ fontSize: 12, color: colors.darkGray, marginBottom: 4 }}>
            {(item as Meal).description}
          </Text>
        )}
        
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 }}>
          {item.tags.slice(0, 2).map((tag) => (
            <View key={tag} style={{
              backgroundColor: '#E9F5EE',
              borderRadius: 10,
              paddingHorizontal: 8,
              paddingVertical: 2,
              marginRight: 6,
              marginBottom: 2
            }}>
              <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '600' }}>
                {tag}
              </Text>
            </View>
          ))}
          
          {item.type === 'restaurant' && (
            <View style={{
              backgroundColor: '#F7F5F0',
              borderRadius: 10,
              paddingHorizontal: 8,
              paddingVertical: 2,
              marginRight: 6,
              marginBottom: 2
            }}>
              <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '600' }}>
                {(item as Restaurant).distance}
              </Text>
            </View>
          )}
        </View>
        
        {item.type === 'meal' && (item as Meal).price && (
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primary }}>
            {(item as Meal).price?.toLocaleString()}
          </Text>
        )}
      </View>
      
      {item.type === 'meal' ? (
        <Button
          title="Edit"
          variant="primary"
          style={{ borderRadius: 8, paddingHorizontal: 18, paddingVertical: 6, minWidth: 70 }}
          onPress={() => handleEditMeal(item as Meal)}
        />
      ) : (
        <Button
          title="View"
          variant="primary"
          style={{ borderRadius: 8, paddingHorizontal: 18, paddingVertical: 6, minWidth: 70 }}
          onPress={() => handleViewRestaurant(item as Restaurant)}
        />
      )}
    </View>
  );

  const currentItems = activeTab === 'Meals' ? 
    (showResults ? searchResults.filter(item => item.type === 'meal') : allMeals) :
    (showResults ? searchResults.filter(item => item.type === 'restaurant') : allRestaurants);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.lightGray, marginTop: 40 }}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 32 }}>
        {/* Header & Search Bar */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <TouchableOpacity style={{ marginRight: 8 }} onPress={handleBack}>
            <Ionicons name="arrow-back" size={22} color={colors.black} />
          </TouchableOpacity>
          <View style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.white,
            borderRadius: 12,
            paddingHorizontal: 10,
            height: 44,
            borderWidth: 1,
            borderColor: colors.gray
          }}>
            <Ionicons name="search" size={18} color={colors.gray} style={{ marginRight: 6 }} />
            <RNTextInput
              placeholder="Search your menu or competitors..."
              value={search}
              onChangeText={setSearch}
              style={{ flex: 1, fontSize: 15, color: colors.black }}
              placeholderTextColor={colors.gray}
            />
            {isLoading && <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 8 }} />}
          </View>
        </View>

        {/* Toggle Buttons */}
        <View style={{ flexDirection: 'row', marginBottom: 10 }}>
          <Button
            title="Your Meals"
            variant={activeTab === 'Meals' ? 'primary' : 'outlineGray'}
            onPress={() => setActiveTab('Meals')}
            style={{ flex: 1, marginRight: 6, borderRadius: 8, paddingVertical: 10 }}
          />
          <Button
            title="Competitors"
            variant={activeTab === 'Restaurants' ? 'primary' : 'outlineGray'}
            onPress={() => setActiveTab('Restaurants')}
            style={{ flex: 1, marginLeft: 6, borderRadius: 8, paddingVertical: 10 }}
          />
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => handleFilterToggle(filter)}
              style={{
                backgroundColor: activeFilters.includes(filter) ? colors.primary : colors.white,
                borderColor: activeFilters.includes(filter) ? colors.primary : colors.gray,
                borderWidth: 1,
                borderRadius: 16,
                paddingHorizontal: 14,
                paddingVertical: 8,
                marginRight: 8,
              }}
            >
              <Text style={{
                color: activeFilters.includes(filter) ? colors.white : colors.primary,
                fontWeight: '600',
                fontSize: 13
              }}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
          {activeFilters.length > 0 && (
            <TouchableOpacity
              onPress={() => setActiveFilters([])}
              style={{
                backgroundColor: '#ff4444',
                borderRadius: 16,
                paddingHorizontal: 12,
                paddingVertical: 8,
                marginLeft: 8,
              }}
            >
              <Text style={{ color: colors.white, fontWeight: '600', fontSize: 12 }}>
                Clear All
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* Results */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8
        }}>
          <Text style={{ fontWeight: '700', fontSize: 16, color: colors.black }}>
            {showResults ? `Search Results (${currentItems.length})` : `${activeTab} (${currentItems.length})`}
          </Text>
          {activeTab === 'Meals' && !showResults && (
            <TouchableOpacity onPress={() => router.push('/add-meal')}>
              <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '600' }}>
                Add New
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {currentItems.length > 0 ? (
          currentItems.map(renderItem)
        ) : (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Ionicons name="search" size={48} color={colors.gray} style={{ marginBottom: 12 }} />
            <Text style={{ fontSize: 16, color: colors.gray, textAlign: 'center' }}>
              {showResults ? 
                `No ${activeTab.toLowerCase()} found for "${search}"` :
                `No ${activeTab.toLowerCase()} available`
              }
            </Text>
            {activeTab === 'Meals' && !showResults && (
              <TouchableOpacity 
                style={{
                  backgroundColor: colors.primary,
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 8,
                  marginTop: 16
                }}
                onPress={() => router.push('/add-meal')}
              >
                <Text style={{ color: colors.white, fontWeight: '600' }}>
                  Add Your First Meal
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
