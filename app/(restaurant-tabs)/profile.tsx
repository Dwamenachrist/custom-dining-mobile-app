import React from 'react';
import { View, Text, SafeAreaView, ScrollView, Image, TouchableOpacity, FlatList } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

// --- Mock Data (replace with API data later) ---
const restaurant = {
  name: 'GreenChef Kitchen',
  image: require('../../assets/restaurants/Green Chef Kitchen.png'),
  tags: ['Vegan Friendly', 'Diabetic-Friendly', 'Plant-Based'],
  location: 'Ikeja',
  rating: 4.8,
  hours: '8am-8pm',
};

const menuItems = [
  {
    id: '1',
    name: 'Fruity Oats',
    price: '3,000',
    image: require('../../assets/meals/Fruity Oats delight.png'),
  },
  {
    id: '2',
    name: 'Avocado Veggie Bowl',
    price: '4,000',
    image: require('../../assets/meals/Avocado Veggie Bowl.png'),
  },
  {
    id: '3',
    name: 'Grilled chicken',
    price: '6,000',
    image: require('../../assets/meals/Grilled Fish and Veggies.png'),
  },
];

const reviews = [
  {
    id: '1',
    author: 'Vivian Eze',
    rating: 5,
    text: "Loved the grilled veggie wrap — tasty, filling, and didn't spike my sugar. Finally, a place I can trust!",
  },
  {
    id: '2',
    author: 'Victor Adewale',
    rating: 5,
    text: "So glad I found this! The tofu bowl was fresh and flavorful, and 100% plant-based. I'll be back.",
  },
];
// --- End Mock Data ---

// --- Sub-components for better structure ---

type StarRatingProps = {
  rating: number;
  size?: number;
};

const StarRating = ({ rating, size = 16 }: StarRatingProps) => (
  <View className="flex-row">
    {[...Array(5)].map((_, i) => (
      <Ionicons
        key={i}
        name={i < Math.floor(rating) ? 'star' : 'star-outline'}
        size={size}
        color={colors.primary}
      />
    ))}
  </View>
);


export default function RestaurantProfileScreen() {
  const router = useRouter();

  const renderMenuItem = ({ item }: { item: typeof menuItems[0] }) => (
    <TouchableOpacity className="mr-4 w-32">
      <Image source={item.image} className="w-32 h-32 rounded-lg mb-2" />
      <Text className="text-darkGray font-medium text-center">{item.name}</Text>
      <Text className="text-primary font-bold text-center">#{item.price}</Text>
    </TouchableOpacity>
  );

  const renderReviewItem = ({ item }: { item: typeof reviews[0] }) => (
    <View className="bg-white p-4 rounded-lg mb-4 w-[48%]">
      <Text className="font-bold text-darkGray mb-1">{item.author}</Text>
      <StarRating rating={item.rating} size={14} />
      <Text className="text-darkGray text-xs mt-2 leading-5">{item.text}</Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F5F5F0]">
      <Stack.Screen
        options={{
          headerTitle: 'Profile',
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#F5F5F0' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="p-2">
              <Ionicons name="arrow-back" size={24} color={colors.darkGray} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={() => { /* Handle Edit Press */ }} className="p-2">
              <Feather name="edit" size={24} color={colors.darkGray} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView>
        <View className="p-6">
          {/* Restaurant Header Image */}
          <Image source={restaurant.image} className="w-full h-48 rounded-xl mb-4" />

          {/* Restaurant Info */}
          <Text className="text-2xl font-bold text-darkGray mb-2">{restaurant.name}</Text>
          
          {/* Tags */}
          <View className="flex-row flex-wrap mb-4">
            {restaurant.tags.map((tag, index) => (
              <View key={index} className="bg-primary-light px-3 py-1 rounded-md mr-2 mb-2">
                <Text className="text-primary font-semibold">{tag}</Text>
          </View>
            ))}
        </View>

          {/* Details */}
          <View className="flex-row justify-between mb-8">
            <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2">
              <Ionicons name="location-outline" size={16} color={colors.darkGray} />
              <Text className="ml-2 text-darkGray">{restaurant.location}</Text>
            </View>
            <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2">
              <Ionicons name="star-outline" size={16} color={colors.darkGray} />
              <Text className="ml-2 text-darkGray">{restaurant.rating}</Text>
          </View>
            <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2">
              <Ionicons name="time-outline" size={16} color={colors.darkGray} />
              <Text className="ml-2 text-darkGray">{restaurant.hours}</Text>
            </View>
          </View>

          {/* Your Menu Section */}
          <View className="mb-8">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-darkGray">Your Menu</Text>
              <TouchableOpacity>
                <Text className="text-primary font-semibold">see all</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={menuItems}
              renderItem={renderMenuItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          </View>

          {/* Reviews Section */}
          <View>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-darkGray">Reviews</Text>
              <TouchableOpacity>
                <Text className="text-primary font-semibold">see all</Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row flex-wrap justify-between">
              {reviews.map((item) => (
                <View key={item.id} className="bg-white p-4 rounded-lg mb-4 w-[48%]">
                  <Text className="font-bold text-darkGray mb-1">{item.author}</Text>
                  <StarRating rating={item.rating} size={14} />
                  <Text className="text-darkGray text-xs mt-2 leading-5">{item.text}</Text>
          </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
