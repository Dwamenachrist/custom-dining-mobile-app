import React from 'react';
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity } from 'react-native';

const categories = [
  { name: 'Breakfast', image: require('../assets/breakfast-card.png') },
  { name: 'Lunch', image: require('../assets/lunch card.png') },
  { name: 'Dinner', image: require('../assets/dinner card.png') },
  { name: 'Snacks', image: require('../assets/snacks-card.png') },
];

export default function CategoryTabs() {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map((category, index) => (
        <TouchableOpacity key={index} style={styles.card}>
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
