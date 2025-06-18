import React from 'react';
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

const categories = [
  { name: 'Breakfast', image: require('../assets/breakfast-card.png'), route: '/breakfast' },
  { name: 'Lunch', image: require('../assets/lunch card.png'), route: '/lunch' },
  { name: 'Dinner', image: require('../assets/dinner card.png'), route: '/dinner' },
  { name: 'Snacks', image: require('../assets/snacks-card.png'), route: '/snacks' },
];

export default function CategoryTabs() {
  const router = useRouter();

  const handleCategoryPress = (category: typeof categories[0]) => {
    router.push(category.route as any);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map((category, index) => (
        <TouchableOpacity 
          key={index} 
          style={styles.card}
          onPress={() => handleCategoryPress(category)}
          activeOpacity={0.8}
        >
          <Image source={category.image} style={styles.image} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  card: {
    width: 100,
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    elevation: 3, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    resizeMode: 'cover',
  },
});
