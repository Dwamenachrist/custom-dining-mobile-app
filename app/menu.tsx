import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '../theme/colors';
import { useAuth } from '../auth-context';
import { useCart } from '../cart-context';
import MealPlanService from '../services/mealPlanService';
import MealPlanToast from '../components/MealPlanToast';

export default function MenuScreen() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { addToCart } = useCart();
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'cart'>('success');

  const menuItems = [
    {
      id: '1',
      name: 'Basmati Jollof Rice',
      description: 'Premium basmati rice cooked in rich tomato sauce with Nigerian spices',
      calories: '520 Cal Per Serving',
      image: require('../assets/meals/Basmati Jollof Rice.png'),
      tags: ['Traditional', 'Gluten-Free'],
      price: 8500
    },
    {
      id: '2',
      name: 'Fruity Oats Delight',
      description: 'A nourishing bowl of rolled oats topped with fresh fruits and chia seeds',
      calories: '310 Cal Per Serving',
      image: require('../assets/meals/Fruity Oats delight.png'),
      tags: ['Low-Carb', 'Sugar-Free'],
      price: 5000
    },
    {
      id: '3',
      name: 'Tofu Rice',
      description: 'Seasoned brown rice served with marinated grilled tofu and vegetables',
      calories: '390 Cal Per Serving',
      image: require('../assets/meals/Tofu Rice.png'),
      tags: ['Vegan', 'High-Protein'],
      price: 7000
    },
    {
      id: '4',
      name: 'Grilled Fish and Veggies',
      description: 'Fresh tilapia grilled to perfection with steamed vegetables',
      calories: '320 Cal Per Serving',
      image: require('../assets/meals/Grilled Fish and Veggies.png'),
      tags: ['High-Protein', 'Omega-3'],
      price: 9500
    },
    {
      id: '5',
      name: 'Turkey and Salad',
      description: 'Lean grilled turkey breast served over mixed greens',
      calories: '280 Cal Per Serving',
      image: require('../assets/meals/Turkey and Salad.png'),
      tags: ['High-Protein', 'Low-Carb'],
      price: 8000
    }
  ];

  const filterTags = ['Low-Carb', 'Sugar-Free', 'Vegan Friendly', 'Diabetic-Friendly'];

  const handleOrder = (item: any) => {
    if (!isLoggedIn) {
      router.push('/(auth)/customer-login');
      return;
    }
    
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      restaurant: 'Restaurant'
    });
    
    setToastVisible(true);
    setToastMessage(`${item.name} added to cart!`);
    setToastType('cart');
  };

  const handleAddToPlan = async (item: any) => {
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
        calories: item.calories,
        price: item.price,
        restaurant: 'Restaurant'
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Restaurant Menu</Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          {filterTags.map((tag, index) => (
            <TouchableOpacity key={index} style={styles.filterTag}>
              <Text style={styles.filterTagText}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.sortContainer}>
          <Text style={styles.sortText}>Sort by</Text>
          <TouchableOpacity style={styles.sortButton}>
            <Text style={styles.sortButtonText}>Most Popular</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

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
                  <TouchableOpacity 
                    style={styles.orderButton}
                    onPress={() => handleOrder(item)}
                  >
                    <Text style={styles.orderButtonText}>Order</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.addToPlanButton}
                    onPress={() => handleAddToPlan(item)}
                  >
                    <Text style={styles.addToPlanButtonText}>Add to Plan</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
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
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItemImage: {
    width: 80,
    height: 80,
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
