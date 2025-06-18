import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '../theme/colors';
import { useAuth } from '../auth-context';

export default function MenuScreen() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  const menuItems = [
    {
      id: 1,
      name: 'Basmati Jollof Rice',
      description: 'Basmati rice with grilled chicken and fresh veggies',
      calories: '700 Cal Per Serving',
      image: require('../assets/recommendation1.png'),
      tags: ['Low-Carb', 'Diabetic-Friendly'],
    },
    {
      id: 2,
      name: 'Fruity Oats Delight',
      description: 'A delightful bowl of oats topped with mixed fruits',
      calories: '450 Cal Per Serving',
      image: require('../assets/recommendation2.png'),
      tags: ['Low-Carb', 'Sugar-Free'],
    },
    {
      id: 3,
      name: 'Tofu Rice',
      description: 'A flavorful dish of rice and tender tofu, with freshly diced veggies',
      calories: '550 Cal Per Serving',
      image: require('../assets/recommendation3.png'),
      tags: ['Vegan', 'Diabetic-Friendly'],
    },
  ];

  const filterTags = ['Low-Carb', 'Sugar-Free', 'Vegan Friendly', 'Diabetic-Friendly'];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Restaurant Menu</Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Filter Tags */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          {filterTags.map((tag, index) => (
            <TouchableOpacity key={index} style={styles.filterTag}>
              <Text style={styles.filterTagText}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Sort Section */}
        <View style={styles.sortContainer}>
          <Text style={styles.sortText}>Sort by</Text>
          <TouchableOpacity style={styles.sortButton}>
            <Text style={styles.sortButtonText}>Most Popular</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View style={styles.menuItems}>
          {menuItems.map((item) => (
            <View key={item.id} style={styles.menuItem}>
              <Image source={item.image} style={styles.menuItemImage} />
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemName}>{item.name}</Text>
                <Text style={styles.menuItemDesc}>{item.description}</Text>
                <View style={styles.calorieRow}>
                  <Ionicons name="time-outline" size={16} color={colors.darkGray} />
                  <Text style={styles.calorieText}>{item.calories}</Text>
                </View>
                <View style={styles.menuTagsRow}>
                  {item.tags.map((tag, index) => (
                    <View key={index} style={styles.menuItemTag}>
                      <Text style={styles.menuItemTagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.orderButton}>
                    <Text style={styles.orderButtonText}>Order</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.addToPlanButton}>
                    <Text style={styles.addToPlanButtonText}>Add to Plan</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 8,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
    color: colors.black,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterTag: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  filterTagText: {
    color: colors.primary,
    fontSize: 14,
  },
  sortContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  sortText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.black,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortButtonText: {
    color: colors.primary,
    marginRight: 4,
  },
  menuItems: {
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItemImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  menuItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 4,
  },
  menuItemDesc: {
    fontSize: 14,
    color: colors.darkGray,
    marginBottom: 8,
  },
  calorieRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  calorieText: {
    fontSize: 12,
    color: colors.darkGray,
    marginLeft: 4,
  },
  menuTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  menuItemTag: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  menuItemTagText: {
    color: colors.white,
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  orderButton: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  orderButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  addToPlanButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  addToPlanButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
}); 