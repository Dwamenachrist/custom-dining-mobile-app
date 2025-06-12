import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

const restaurants = [
  {
    id: '1',
    name: 'GreenChef Kitchen',
    image: require('../assets/restaurant1.png'), // update path
    deliveryTime: '20 - 30 min',
    rating: '4.7',
    address: '123 Veggie Street, Ikeja, Lagos',
    tags: ['Vegan Friendly', 'Diabetic-Friendly'],
  },
  {
    id: '2',
    name: 'NutriPot',
    image: require('../assets/restaurant2.png'),
    deliveryTime: '20 - 30 min',
    rating: '4.9',
    address: '123, veggies Street,Abuja',
    tags: ['Healthy Lunch', 'Customized Menu'],
  },
];

export default function TopRestaurants() {
  const router = useRouter();

  const handleSeeAll = () => {
    router.push('/restaurants'); 
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Top Restaurants</Text>
        <TouchableOpacity onPress={handleSeeAll}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {restaurants.map((restaurant) => (
          <View key={restaurant.id} style={styles.card}>
            <View style={styles.imageWrapper}>
              <Image source={restaurant.image} style={styles.image} />
              <View style={styles.bottomOverlay}>
                <Text style={styles.deliveryTime}>{restaurant.deliveryTime}</Text>
                <Text style={styles.rating}>{restaurant.rating}</Text>
              </View>
            </View>

            <View style={styles.info}>
              <Text style={styles.name}>{restaurant.name}</Text>
              <Text style={styles.address}>{restaurant.address}</Text>
              <View style={styles.tags}>
                {restaurant.tags.map((tag, index) => (
                  <Text key={index} style={styles.tag}>{tag}</Text>
                ))}
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  header: {
    fontSize: 18,
    fontWeight: '600',
  },
  seeAll: {
    fontSize: 14,
    color: '#1A5E3E',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginLeft: 16,
    width: 250,
    overflow: 'hidden',
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 140,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  deliveryTime: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    color: '#fff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    fontSize: 12,
  },
  rating: {
    backgroundColor: 'gold',
    color: '#000',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 'bold',
  },
  info: {
    padding: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  address: {
    fontSize: 12,
    color: '#777',
    marginVertical: 4,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#004d00',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    marginRight: 6,
    marginBottom: 4,
  },
});
