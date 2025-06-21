import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StatusBar, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { useAuth } from '../../auth-context';
import api from '../../services/api';
import { getAssetFromMapping } from '../../services/assetMapping';

interface DashboardStats {
  todayOrders: number;
  totalRevenue: number;
  topDish: string;
  totalMeals: number;
}

interface MealItem {
  id: string;
  name: string;
  description: string;
  price: number;
  dietaryTags: string[];
  orderCount?: number;
}

export default function RestaurantHomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [meals, setMeals] = useState<MealItem[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    todayOrders: 0,
    totalRevenue: 0,
    topDish: 'N/A',
    totalMeals: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const restaurantId = user?.restaurantId || '683c5e59a91c66e8f9486c17';
      console.log(' Loading dashboard data for restaurant:', restaurantId);
      
      // Load meals
      const mealsResponse = await api.get(`/meals/restaurant/${restaurantId}`);
      
      if (mealsResponse.success && mealsResponse.data) {
        const mealData = mealsResponse.data.slice(0, 3).map((meal: any) => ({
          id: meal._id || meal.id,
          name: meal.name,
          description: meal.description,
          price: typeof meal.price === 'string' ? parseFloat(meal.price) : meal.price,
          dietaryTags: meal.dietaryTags || [],
          orderCount: Math.floor(Math.random() * 20) + 1 // Mock order count
        }));
        
        setMeals(mealData);
        
        // Calculate stats
        const totalMeals = mealsResponse.data.length;
        const todayOrders = Math.floor(Math.random() * 50) + 10;
        const totalRevenue = todayOrders * 3500; // Average order value
        const topDish = mealData.length > 0 ? mealData[0].name : 'N/A';
        
        setStats({
          todayOrders,
          totalRevenue,
          topDish,
          totalMeals
        });
        
        console.log(' Dashboard data loaded successfully');
      } else {
        // Use sample data if no backend data
        const sampleMeals: MealItem[] = [
          {
            id: '1',
            name: 'Fruity Oats Delight',
            description: 'Nourishing oats with fresh fruits',
            price: 5000,
            dietaryTags: ['Healthy', 'Vegetarian'],
            orderCount: 12
          },
          {
            id: '2',
            name: 'Basmati Jollof Rice',
            description: 'Premium basmati rice with spices',
            price: 8500,
            dietaryTags: ['Traditional', 'Gluten-Free'],
            orderCount: 8
          },
          {
            id: '3',
            name: 'Grilled Fish & Veggies',
            description: 'Fresh grilled fish with vegetables',
            price: 9500,
            dietaryTags: ['High-Protein', 'Omega-3'],
            orderCount: 15
          }
        ];
        
        setMeals(sampleMeals);
        setStats({
          todayOrders: 24,
          totalRevenue: 84000,
          topDish: 'Grilled Fish & Veggies',
          totalMeals: 12
        });
        
        console.log(' Using sample dashboard data');
      }
    } catch (err: any) {
      console.error(' Error loading dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add-meal':
        router.push('/add-meal');
        break;
      case 'orders':
        router.push('/(restaurant-tabs)/order');
        break;
      case 'reviews':
        router.push('/reviews?itemName=Restaurant');
        break;
      case 'menu':
        router.push('/(restaurant-tabs)/menu-management');
        break;
      default:
        console.log('Quick action:', action);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.lightGray }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 16, fontSize: 16, color: colors.darkGray }}>
            Loading dashboard...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.lightGray }}>
      <StatusBar barStyle="dark-content" />
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={{ 
          paddingHorizontal: 20, 
          paddingTop: 16, 
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          <TouchableOpacity 
            style={{ flexDirection: 'row', alignItems: 'center' }}
            onPress={() => router.push('/restaurant-profile?id=1&name=Health n Healthy')}
          >
            <Image 
              source={require('../../assets/restaurant-logo.png')} 
              style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }} 
            />
            <View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.black }}>
                Health n Healthy
              </Text>
              <Text style={{ fontSize: 12, color: colors.darkGray }}>
                View Profile
              </Text>
            </View>
          </TouchableOpacity>
          
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.black }}>
            Dashboard
          </Text>
          
          <TouchableOpacity onPress={() => router.push('/restaurant-notifications')}>
            <Ionicons name="notifications-outline" size={24} color={colors.black} />
          </TouchableOpacity>
        </View>

        {/* Featured Dish */}
        <View style={{
          backgroundColor: colors.white,
          borderRadius: 16,
          marginHorizontal: 20,
          marginTop: 20,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2
        }}>
          <Image 
            source={getAssetFromMapping(meals[0]?.name) || require('../../assets/meals/Fruity Oats delight.png')} 
            style={{ width: 64, height: 64, borderRadius: 12, marginRight: 16 }} 
          />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, color: colors.darkGray, marginBottom: 4 }}>
              Featured Dish | Ordered {meals[0]?.orderCount || 12} times
            </Text>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.primary, marginBottom: 8 }}>
              {meals[0]?.name || 'Fruity Oats Delight'}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {(meals[0]?.dietaryTags || ['Healthy', 'Vegetarian']).slice(0, 2).map((tag, index) => (
                <View key={index} style={{
                  backgroundColor: '#dcfce7',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8
                }}>
                  <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginHorizontal: 20,
          marginTop: 20,
          gap: 8
        }}>
          <View style={{
            flex: 1,
            backgroundColor: colors.white,
            borderRadius: 16,
            alignItems: 'center',
            paddingVertical: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2
          }}>
            <MaterialIcons name="shopping-bag" size={28} color={colors.primary} />
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.black, marginTop: 8 }}>
              {stats.todayOrders}
            </Text>
            <Text style={{ fontSize: 12, color: colors.darkGray, marginTop: 4 }}>
              Today's Orders
            </Text>
          </View>

          <View style={{
            flex: 1,
            backgroundColor: colors.white,
            borderRadius: 16,
            alignItems: 'center',
            paddingVertical: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2
          }}>
            <FontAwesome5 name="star" size={24} color={colors.primary} />
            <Text style={{ 
              fontSize: 16, 
              fontWeight: 'bold', 
              color: colors.black, 
              marginTop: 8,
              textAlign: 'center'
            }}>
              {stats.topDish.length > 10 ? stats.topDish.substring(0, 10) + '...' : stats.topDish}
            </Text>
            <Text style={{ fontSize: 12, color: colors.darkGray, marginTop: 4 }}>
              Top Dish
            </Text>
          </View>

          <View style={{
            flex: 1,
            backgroundColor: colors.white,
            borderRadius: 16,
            alignItems: 'center',
            paddingVertical: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2
          }}>
            <MaterialIcons name="attach-money" size={28} color={colors.primary} />
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.black, marginTop: 8 }}>
              {(stats.totalRevenue / 1000).toFixed(0)}k
            </Text>
            <Text style={{ fontSize: 12, color: colors.darkGray, marginTop: 4 }}>
              Revenue
            </Text>
          </View>
        </View>

        {/* Menu Snapshot */}
        <View style={{ marginHorizontal: 20, marginTop: 28 }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12
          }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.black }}>
              Menu Snapshot
            </Text>
            <TouchableOpacity onPress={() => handleQuickAction('menu')}>
              <Text style={{ fontSize: 14, color: colors.primary, fontWeight: '600' }}>
                View All
              </Text>
            </TouchableOpacity>
          </View>

          {error ? (
            <View style={{
              backgroundColor: colors.white,
              borderRadius: 16,
              padding: 16,
              alignItems: 'center'
            }}>
              <Text style={{ color: '#ff4444', fontSize: 14, textAlign: 'center' }}>
                {error}
              </Text>
              <TouchableOpacity 
                style={{ marginTop: 8 }} 
                onPress={loadDashboardData}
              >
                <Text style={{ color: colors.primary, fontWeight: '600' }}>
                  Retry
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ gap: 8 }}>
              {meals.map((meal) => (
                <View key={meal.id} style={{
                  backgroundColor: colors.white,
                  borderRadius: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 16,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2
                }}>
                  <Image 
                    source={getAssetFromMapping(meal.name) || require('../../assets/meals/Basmati Jollof Rice.png')} 
                    style={{ width: 56, height: 56, borderRadius: 8, marginRight: 12 }} 
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={{ 
                      fontWeight: '600', 
                      color: colors.primary, 
                      fontSize: 16,
                      marginBottom: 4
                    }}>
                      {meal.name}
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                      {meal.dietaryTags.slice(0, 2).map((tag, idx) => (
                        <View key={idx} style={{
                          backgroundColor: '#dcfce7',
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                          borderRadius: 6
                        }}>
                          <Text style={{ 
                            color: colors.primary, 
                            fontSize: 11, 
                            fontWeight: '600' 
                          }}>
                            {tag}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  <Text style={{ 
                    color: colors.black, 
                    fontWeight: 'bold', 
                    fontSize: 16 
                  }}>
                    {meal.price.toLocaleString()}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={{ marginHorizontal: 20, marginTop: 32 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.black, marginBottom: 12 }}>
            Quick Actions
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
            <TouchableOpacity 
              style={{
                flex: 1,
                backgroundColor: colors.white,
                borderRadius: 16,
                alignItems: 'center',
                paddingVertical: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2
              }}
              onPress={() => handleQuickAction('add-meal')}
            >
              <Ionicons name="add-circle-outline" size={32} color={colors.primary} />
              <Text style={{ color: colors.primary, fontWeight: '600', marginTop: 8 }}>
                Add Dish
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={{
                flex: 1,
                backgroundColor: colors.white,
                borderRadius: 16,
                alignItems: 'center',
                paddingVertical: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2
              }}
              onPress={() => handleQuickAction('orders')}
            >
              <MaterialIcons name="shopping-bag" size={28} color={colors.primary} />
              <Text style={{ color: colors.primary, fontWeight: '600', marginTop: 8 }}>
                Orders
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={{
                flex: 1,
                backgroundColor: colors.white,
                borderRadius: 16,
                alignItems: 'center',
                paddingVertical: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2
              }}
              onPress={() => handleQuickAction('reviews')}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={28} color={colors.primary} />
              <Text style={{ color: colors.primary, fontWeight: '600', marginTop: 8 }}>
                Reviews
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
