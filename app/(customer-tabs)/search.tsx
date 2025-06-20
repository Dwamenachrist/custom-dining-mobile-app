import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, TextInput as RNTextInput, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { useAuth } from '../../auth-context';
import { Button } from '../../components/Button';
import { getHybridMeals } from '../../services/hybridMealService';
import MealPlanService from '../../services/mealPlanService';
import MealPlanToast from '../../components/MealPlanToast';

interface BackendMeal {
  id: string;
  name: string;
  description: string;
  price: string;
  image?: string;
  dietaryTags: string[];
  restaurant?: { name: string };
}

interface Restaurant {
  id: string;
  name: string;
  image: any;
  tags: string[];
  rating: number;
  reviewCount: number;
  distance?: string;
  type: 'restaurant';
}

interface Meal {
  id: string;
  name: string;
  description: string;
  price: number;
  image: any;
  tags: string[];
  restaurant?: string;
  type: 'meal';
}

const convertHybridRestaurant = (restaurant: any): Restaurant => ({
  id: restaurant.id,
  name: restaurant.name,
  image: restaurant.image || require('../../assets/restaurant1.png'),
  tags: restaurant.tags || ['Restaurant'],
  rating: restaurant.rating || 4.5,
  reviewCount: restaurant.reviewCount || 100,
  distance: restaurant.distance || '2.0 km',
  type: 'restaurant'
});

const convertHybridMeal = (meal: BackendMeal): Meal => ({
  id: meal.id,
  name: meal.name,
  description: meal.description,
  price: parseFloat(meal.price) || 0,
  image: meal.image || require('../../assets/recommendation1.png'),
  tags: meal.dietaryTags.slice(0, 2),
  restaurant: meal.restaurant?.name || 'Restaurant',
  type: 'meal'
});

const FILTERS = ['Vegan', 'Gluten-Free', 'Low-Carb', 'High-Protein', 'Dairy-Free', 'Keto'];

export default function SearchScreen() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'meals' | 'restaurants'>('meals');
  const [meals, setMeals] = useState<Meal[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredMeals, setFilteredMeals] = useState<Meal[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'cart'>('success');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchQuery, activeFilters, meals, restaurants]);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log(' Loading search data...');
      
      const response = await getHybridMeals();
      
      if (response.success && response.data) {
        const convertedMeals = response.data.map(convertHybridMeal);
        setMeals(convertedMeals);
        console.log(` Loaded ${convertedMeals.length} meals for search`);
      }
      
      // Sample restaurants
      const sampleRestaurants: Restaurant[] = [
        { id: '1', name: 'Green Chef Kitchen', image: require('../../assets/restaurants/Green Chef Kitchen.png'), tags: ['Vegan', 'Organic'], rating: 4.8, reviewCount: 120, distance: '1.2 km', type: 'restaurant' },
        { id: '2', name: 'Health n Healthy', image: require('../../assets/restaurants/Health n Healthy.png'), tags: ['Healthy', 'Fresh'], rating: 4.6, reviewCount: 89, distance: '2.1 km', type: 'restaurant' },
        { id: '3', name: 'NOK By Alara', image: require('../../assets/restaurants/NOK By Alara.png'), tags: ['Traditional', 'Local'], rating: 4.7, reviewCount: 156, distance: '1.8 km', type: 'restaurant' }
      ];
      setRestaurants(sampleRestaurants);
      
    } catch (error) {
      console.error(' Error loading search data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (items: (Meal | Restaurant)[]): (Meal | Restaurant)[] => {
    if (activeFilters.length === 0) return items;
    
    return items.filter(item => 
      activeFilters.some(filter => 
        item.tags.some(tag => tag.toLowerCase().includes(filter.toLowerCase()))
      )
    );
  };

  const handleSearch = async () => {
    if (searchQuery.trim() === '') {
      setShowResults(false);
      setFilteredMeals([]);
      setFilteredRestaurants([]);
      return;
    }

    setLoading(true);
    setShowResults(true);

    try {
      const query = searchQuery.toLowerCase();
      
      const searchedMeals = meals.filter(meal =>
        meal.name.toLowerCase().includes(query) ||
        meal.description.toLowerCase().includes(query) ||
        meal.tags.some(tag => tag.toLowerCase().includes(query))
      );
      
      const searchedRestaurants = restaurants.filter(restaurant =>
        restaurant.name.toLowerCase().includes(query) ||
        restaurant.tags.some(tag => tag.toLowerCase().includes(query))
      );
      
      setFilteredMeals(applyFilters(searchedMeals) as Meal[]);
      setFilteredRestaurants(applyFilters(searchedRestaurants) as Restaurant[]);
      
      console.log(` Search results: ${searchedMeals.length} meals, ${searchedRestaurants.length} restaurants`);
      
    } catch (error) {
      console.error(' Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterToggle = (filter: string) => {
    const newFilters = activeFilters.includes(filter) 
      ? activeFilters.filter(f => f !== filter) 
      : [...activeFilters, filter];
    
    setActiveFilters(newFilters);
    console.log(` Filter toggled: ${filter}, Active filters:`, newFilters);
  };

  const handleAddToPlan = async (item: Meal) => {
    if (!isLoggedIn) {
      router.push('/(auth)/customer-login');
      return;
    }
    
    try {
      const result = await MealPlanService.addMealToPlan({
        id: item.id,
        name: item.name,
        description: item.description,
        image: item.image,
        tags: item.tags,
        calories: '300 Cal Per Serving',
        price: item.price,
        restaurant: item.restaurant
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

  const handleViewRestaurant = (item: Restaurant) => {
    router.push({
      pathname: '/restaurant-profile',
      params: {
        id: item.id,
        name: item.name,
        rating: item.rating.toString(),
        reviewCount: item.reviewCount.toString(),
        imageSource: JSON.stringify(item.image),
        tags: JSON.stringify(item.tags),
        distance: item.distance || '2.0 km',
        deliveryTime: '25-35 min'
      }
    });
  };

  const handleBack = () => {
    router.back();
  };

  const handleLocationFilter = () => {
    router.push('/location-search');
  };

  const renderItem = (item: Meal | Restaurant) => (
    <View key={item.id} style={{ backgroundColor: colors.white, borderRadius: 16, padding: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1 }}>
      <Image source={item.image} style={{ width: 56, height: 56, borderRadius: 12, marginRight: 12 }} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: '700', fontSize: 15, color: colors.primary, marginBottom: 2 }}>
          {item.name.split(' ')[0]} <Text style={{ color: colors.black, fontWeight: '400' }}>{item.name.split(' ').slice(1).join(' ')}</Text>
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 }}>
          {item.tags.map((tag) => (
            <View key={tag} style={{ backgroundColor: '#E9F5EE', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, marginRight: 6, marginBottom: 2 }}>
              <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '600' }}>{tag}</Text>
            </View>
          ))}
          {item.type === 'restaurant' && (
            <View style={{ backgroundColor: '#F7F5F0', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, marginRight: 6, marginBottom: 2 }}>
              <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '600' }}>{(item as Restaurant).distance}</Text>
            </View>
          )}
        </View>
      </View>
      {item.type === 'meal' ? (
        <Button
          title="Add to Plan"
          variant="primary"
          style={{ borderRadius: 8, paddingHorizontal: 14, paddingVertical: 6, minWidth: 90 }}
          onPress={() => handleAddToPlan(item as Meal)}
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

  const currentItems = activeTab === 'meals' ? filteredMeals : filteredRestaurants;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.lightGray, marginTop: 40 }}>
      <StatusBar barStyle="light-content" backgroundColor="#f7f5f0" />
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 32 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <TouchableOpacity style={{ marginRight: 8 }} onPress={handleBack}>
            <Ionicons name="arrow-back" size={22} color={colors.black} />
          </TouchableOpacity>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 12, paddingHorizontal: 10, height: 44, borderWidth: 1, borderColor: colors.gray }}>
            <Ionicons name="search" size={18} color={colors.gray} style={{ marginRight: 6 }} />
            <RNTextInput
              placeholder="Search for meals, restaurants..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{ flex: 1, fontSize: 15, color: colors.black }}
              placeholderTextColor={colors.gray}
            />
            {loading && <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 8 }} />}
            <TouchableOpacity onPress={handleLocationFilter}>
              <Ionicons name="options" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ flexDirection: 'row', marginBottom: 10 }}>
          <Button
            title="Meals"
            variant={activeTab === 'meals' ? 'primary' : 'outlineGray'}
            onPress={() => setActiveTab('meals')}
            style={{ flex: 1, marginRight: 6, borderRadius: 8, paddingVertical: 10 }}
          />
          <Button
            title="Restaurants"
            variant={activeTab === 'restaurants' ? 'primary' : 'outlineGray'}
            onPress={() => setActiveTab('restaurants')}
            style={{ flex: 1, marginLeft: 6, borderRadius: 8, paddingVertical: 10 }}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }} contentContainerStyle={{ gap: 8 }}>
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

        {showResults ? (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontWeight: '700', fontSize: 16, color: colors.black }}>
                Search Results ({currentItems.length} {activeTab})
              </Text>
            </View>
            {currentItems.length > 0 ? (
              currentItems.map(renderItem)
            ) : (
              <View style={{ alignItems: 'center', marginTop: 40 }}>
                <Ionicons name="search" size={48} color={colors.gray} style={{ marginBottom: 12 }} />
                <Text style={{ fontSize: 16, color: colors.gray, textAlign: 'center' }}>
                  No {activeTab} found for "{searchQuery}"
                </Text>
                <Text style={{ fontSize: 14, color: colors.gray, textAlign: 'center', marginTop: 4 }}>
                  Try different keywords or filters
                </Text>
              </View>
            )}
          </>
        ) : (
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Ionicons name="search" size={64} color={colors.gray} style={{ marginBottom: 16 }} />
            <Text style={{ fontSize: 18, color: colors.black, fontWeight: '600', marginBottom: 8 }}>
              Search for meals & restaurants
            </Text>
            <Text style={{ fontSize: 14, color: colors.gray, textAlign: 'center' }}>
              Find your favorite healthy meals and discover new restaurants near you
            </Text>
          </View>
        )}
      </ScrollView>
      
      <MealPlanToast
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
