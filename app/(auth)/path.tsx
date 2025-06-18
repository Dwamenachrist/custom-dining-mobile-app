import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Touchable } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PathScreen() {
  const [selected, setSelected] = useState<'customer' | 'restaurant' | null>(null);
  const [customerPressed, setCustomerPressed] = useState(false);
  const [restaurantPressed, setRestaurantPressed] = useState(false);
  const router = useRouter();

interface HandleSelection {
    (type: 'customer' | 'restaurant'): void;
}

const handleSelection: HandleSelection = async (type) => {
    setSelected(type);
    
    // Store user type in AsyncStorage
    try {
        await AsyncStorage.setItem('userType', type);
        console.log('User type stored:', type);
    } catch (error) {
        console.error('Error storing user type:', error);
    }
    
    // Navigate to the respective screen
    if (type === 'customer') {
        router.push('/(auth)/customer-onboard' as any);
    } else if (type === 'restaurant') {
        router.push('/(auth)/restaurant-onboard' as any);
    }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Who are you?</Text>
      <View style={styles.optionsContainer}>
        {/* Customer Option */}
        <TouchableOpacity
          activeOpacity={1}
          onPressIn={() => setCustomerPressed(true)}
          onPressOut={() => setCustomerPressed(false)}
          onPress={() => handleSelection('customer')}
          style={[
            styles.option,
            (selected === 'customer' || customerPressed) && {
              borderColor: customerPressed ? colors.primary : colors.gray,
              backgroundColor: customerPressed ? '#ffffff' : colors.white ,
            },
          ]}
        >
          <Image
            source={require('../../assets/customer.png')}
            style={styles.image}
          />
          <Text style={styles.optionText}>I'm a Customer</Text>
        </TouchableOpacity>

        {/* Restaurant Option */}
        <TouchableOpacity
          activeOpacity={1}
          onPressIn={() => setRestaurantPressed(true)}
          onPressOut={() => setRestaurantPressed(false)}
          onPress={() => handleSelection('restaurant')}
          style={[
            styles.option,
            (selected === 'restaurant' || restaurantPressed) && {
              borderColor: '#ffb27c',
              backgroundColor: restaurantPressed ? 'rgba(255, 255, 255, 255)' : colors.white,
            },
          ]}
        >
          <Image
            source={require('../../assets/restaurant.png')}
            style={styles.image}
          />
          <Text style={styles.optionText}>I'm a Restaurant</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 32,
    color: colors.black, // Use theme color
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Better spacing
    width: '100%',
  },
  option: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 2, // Increased border width for better visibility
    borderColor: colors.lightGray, // Default border color from theme
    borderRadius: 8,
    width: '45%',
    backgroundColor: colors.white, // Default background
  },
  // selectedOption style is now handled inline for dynamic colors
  image: {
    width: 50,
    height: 50,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.darkGray, // Use theme color
  },
});