import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const MEALS = [
  {
    id: 1,
    title: 'Avocado Veggie Bowl',
    image: require('../../assets/recommendation1.png'),
    highlight: 'Avocado',
    description: "Tender grilled chicken paired with fresh vegetables and creamy avocado, creating a nutritious and delicious combination that's both satisfying and filling.",
    tags: ['Low-Carb', 'Sugar-Free', 'High Fiber', 'Vegan'],
    price: 5000,
    available: true,
    nutrition: [
      { label: 'Calories', value: '350 kcal' },
      { label: 'Total Carbohydrates', value: '10 g' },
      { label: 'Protein', value: '35 g' },
      { label: 'Fiber', value: '10 g' },
      { label: 'Fats', value: '15 g' },
      { label: 'Potassium', value: '90 mg' },
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
    console.log('Order Now');
    router.push('/cart');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meal Detail</Text>
        <View style={{ width: 24 }} />
      </View>
      <Image source={meal.image} style={styles.mealImage} />
      <Text style={styles.mealTitle}>
        <Text style={{ color: '#3A7752', fontWeight: '700' }}>{meal.highlight}</Text>
        <Text> {meal.title.replace(meal.highlight, '')}</Text>
      </Text>
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
        <Text style={styles.price}>#5,000</Text>
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
        <TouchableOpacity style={styles.orderButton}>
          <Text style={styles.orderButtonText} onPress={ handleOrderNow}>Order Now</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F5F0',
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
    marginTop: 16,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },
  mealImage: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    marginBottom: 18,
    backgroundColor: '#C7D7C9',
  },
  mealTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    color: '#222',
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222',
    marginTop: 8,
    marginBottom: 4,
  },
  description: {
    color: '#444',
    fontSize: 14,
    marginBottom: 10,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  tag: {
    backgroundColor: '#3A7752',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 6,
  },
  tagText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    marginRight: 10,
  },
  available: {
    color: '#3A7752',
    fontWeight: '600',
    fontSize: 14,
  },
  nutritionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 18,
    marginTop: 6,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  nutritionLabel: {
    color: '#444',
    fontSize: 15,
  },
  nutritionValue: {
    color: '#222',
    fontWeight: '600',
    fontSize: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginTop: 8,
  },
  addButton: {
    flex: 1,
    backgroundColor: '#3A7752',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginRight: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  orderButton: {
    flex: 1,
    backgroundColor: '#FFD600',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginLeft: 8,
  },
  orderButtonText: {
    color: '#222',
    fontWeight: '700',
    fontSize: 16,
  },
}); 