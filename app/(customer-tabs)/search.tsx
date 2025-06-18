import React, { useState, useEffect } from 'react';
import { View, Text, TextInput as RNTextInput, TouchableOpacity, ScrollView, Image, StatusBar, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { Button } from '../../components/Button';
import { useRouter } from 'expo-router';
import { useAuth } from '../../auth-context';

// Types
interface Meal {
  id: string;
  type: 'meal';
  name: string;
  image: any;
  tags: string[];
  calories?: number;
  price?: number;
}

interface Restaurant {
  id: string;
  type: 'restaurant';
  name: string;
  image: any;
  tags: string[];
  distance: string;
  rating?: number;
}

type SearchItem = Meal | Restaurant;

const FILTERS = ['Low-Carb', 'Sugar-Free', 'Vegan Friendly', 'Diabetic-Friendly'];

// Mock data - In a real app, this would come from an API
const SUGGESTED_MEALS: SearchItem[] = [
  {
    id: '1',
    type: 'meal',
    name: 'Avocado Veggie Bowl',
    image: require('../../assets/recommendation1.png'),
    tags: ['Low-Carb', 'Sugar-Free'],
    calories: 450,
    price: 12.99,
  },
  {
    id: '2',
    type: 'restaurant',
    name: 'Green Chef Kitchen',
    image: require('../../assets/restaurant1.png'),
    tags: ['Vegan Friendly'],
    distance: '1.2 km away',
    rating: 4.5,
  },
];

const RECENT_MEALS: Meal[] = [
  {
    id: '3',
    type: 'meal',
    name: 'Basmati Jollof Rice',
    image: require('../../assets/recommendation2.png'),
    tags: ['Low-Carb', 'Diabetic-Friendly'],
    calories: 380,
    price: 9.99,
  },
  {
    id: '4',
    type: 'meal',
    name: 'Tofu Rice',
    image: require('../../assets/recommendation3.png'),
    tags: ['Diabetic-Friendly'],
    calories: 320,
    price: 8.99,
  },
];

export default function SearchScreen() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'Meals' | 'Restaurants'>('Meals');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Handle search input changes
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
  }, [search]);

  // Filter items based on active filters
  const filterItems = (items: SearchItem[]) => {
    if (activeFilters.length === 0) return items;
    return items.filter(item => 
      item.tags.some(tag => activeFilters.includes(tag))
    );
  };

  // Handle search
  const handleSearch = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call
      const results = [...SUGGESTED_MEALS, ...RECENT_MEALS].filter(item => 
        item.name.toLowerCase().includes(search.toLowerCase())
      );
      setSearchResults(results);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterToggle = (filter: string) => {
    setActiveFilters(prev =>
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  };

  const handleAddToPlan = (item: Meal) => {
    if (!isLoggedIn) {
      router.push('/(auth)/customer-login');
      return;
    }
    // TODO: Implement add to meal plan functionality
    console.log('Adding to plan:', item.name);
  };

  const handleViewRestaurant = (item: Restaurant) => {
    router.push(`/restaurants?id=${item.id}`);
  };

  const handleBack = () => {
    router.back();
  };

  const handleLocationFilter = () => {
    router.push('/location-search');
  };

  const renderItem = (item: SearchItem) => (
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
          {item.type === 'restaurant' && 'distance' in item && (
            <View style={{ backgroundColor: '#F7F5F0', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, marginRight: 6, marginBottom: 2 }}>
              <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '600' }}>{item.distance}</Text>
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.lightGray, marginTop: 40 }}>
      <StatusBar barStyle="light-content" backgroundColor="#f7f5f0" />
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 32 }}>
        {/* Header & Search Bar */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <TouchableOpacity style={{ marginRight: 8 }} onPress={handleBack}>
            <Ionicons name="arrow-back" size={22} color={colors.black} />
          </TouchableOpacity>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 12, paddingHorizontal: 10, height: 44, borderWidth: 1, borderColor: colors.gray }}>
            <Ionicons name="search" size={18} color={colors.gray} style={{ marginRight: 6 }} />
            <RNTextInput
              placeholder="Search for meals, restaurants..."
              value={search}
              onChangeText={setSearch}
              style={{ flex: 1, fontSize: 15, color: colors.black }}
              placeholderTextColor={colors.gray}
            />
            {isLoading && <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 8 }} />}
            <TouchableOpacity onPress={handleLocationFilter}>
              <Ionicons name="options" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Toggle Buttons */}
        <View style={{ flexDirection: 'row', marginBottom: 10 }}>
          <Button
            title="Meals"
            variant={activeTab === 'Meals' ? 'primary' : 'outlineGray'}
            onPress={() => setActiveTab('Meals')}
            style={{ flex: 1, marginRight: 6, borderRadius: 8, paddingVertical: 10 }}
          />
          <Button
            title="Restaurants"
            variant={activeTab === 'Restaurants' ? 'primary' : 'outlineGray'}
            onPress={() => setActiveTab('Restaurants')}
            style={{ flex: 1, marginLeft: 6, borderRadius: 8, paddingVertical: 10 }}
          />
        </View>

        {/* Filter Chips */}
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
                paddingVertical: 6,
                marginRight: 8,
              }}
              activeOpacity={0.85}
            >
              <Text style={{ color: activeFilters.includes(filter) ? colors.white : colors.primary, fontWeight: '600', fontSize: 13 }}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {showResults ? (
          // Search Results
          <>
            <Text style={{ fontWeight: '700', fontSize: 16, color: colors.black, marginBottom: 8 }}>
              Search Results
            </Text>
            {searchResults.length > 0 ? (
              filterItems(searchResults).map(renderItem)
            ) : (
              <Text style={{ textAlign: 'center', color: colors.gray, marginTop: 20 }}>
                No results found
              </Text>
            )}
          </>
        ) : (
          // Default View (Suggested & Recent)
          <>
            {/* Suggested For You */}
            <Text style={{ fontWeight: '700', fontSize: 16, color: colors.black, marginBottom: 8 }}>
              Suggested For You
            </Text>
            {filterItems(SUGGESTED_MEALS).map(renderItem)}

            {/* Recent */}
            <Text style={{ fontWeight: '700', fontSize: 16, color: colors.black, marginBottom: 8, marginTop: 10 }}>
              Recent
            </Text>
            {filterItems(RECENT_MEALS).map(renderItem)}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
} 
