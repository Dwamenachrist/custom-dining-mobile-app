import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, StatusBar, SafeAreaView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const MEALS = [
  {
    id: 1,
    title: 'Fruity Oats delight',
    image: require('../../assets/breakfast.png'),
    description: "A nourishing bowl of rolled oats topped with fresh bananas, blueberries, and seeds. Served warm with almond milk. Perfect for starting your day right—no added sugar, just natural sweetness.",
    tags: ['Low-Carb', 'Sugar-Free', 'High Fiber', 'Vegan'],
    price: 5000,
    available: true,
    nutrition: [
      { label: 'Calories', value: '310 kcal' },
      { label: 'Total Carbohydrates', value: '38 g' },
      { label: 'Sugars (Natural)', value: '10 g' },
      { label: 'Fiber', value: '6 g' },
      { label: 'Fats', value: '8 g' },
      { label: 'Sodium', value: '90 mg' },
    ],
  },
  // Add more meals as needed
];

export default function MealDetail() {
  const { id } = useLocalSearchParams();
  const meal = MEALS.find((m) => m.id === Number(id));

  if (!meal) {
    return (
      <View style={styles.centered}>
        <Text>Meal not found.</Text>
      </View>
    );
  }

  const handleOrderNow = () => {
    router.push('/checkout');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#f7f5f0" />
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Meal Detail</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.imageContainer}>
          <Image source={meal.image} style={styles.mealImage} resizeMode="cover" />
        </View>

        <Text style={styles.mealTitle}>{meal.title}</Text>
        
        <Text style={styles.sectionLabel}>Description</Text>
        <Text style={styles.description}>{meal.description}</Text>
        
        <View style={styles.tagRow}>
          {meal.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.price}>#{meal.price.toLocaleString()}</Text>
          <Text style={styles.available}>{meal.available ? 'Available' : 'Unavailable'}</Text>
        </View>

        <Text style={styles.sectionLabel}>Nutrition Info</Text>
        <View style={styles.nutritionCard}>
          {meal.nutrition.map((item) => (
            <View key={item.label} style={styles.nutritionRow}>
              <Text style={styles.nutritionLabel}>{item.label}</Text>
              <Text style={styles.nutritionValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>Add to Plan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.orderButton} onPress={handleOrderNow}>
            <Text style={styles.orderButtonText}>Order Now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f5f0',
    marginTop: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#f7f5f0',
    paddingHorizontal: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 48,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  mealImage: {
    width: '100%',
    height: '100%',
  },
  mealTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#222',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
    marginBottom: 8,
  },
  description: {
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#E8F5E9',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  tagText: {
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  available: {
    color: '#2E7D32',
    fontSize: 14,
  },
  nutritionCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 24,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  nutritionLabel: {
    color: '#444',
    fontSize: 14,
  },
  nutritionValue: {
    color: '#222',
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  addButton: {
    flex: 1,
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  orderButton: {
    flex: 1,
    backgroundColor: '#FDD835',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  orderButtonText: {
    color: '#222',
    fontWeight: '600',
    fontSize: 14,
  },
}); 