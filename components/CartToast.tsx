import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

interface CartToastProps {
  visible: boolean;
  mealName: string;
  onClose: () => void;
}

export const CartToast: React.FC<CartToastProps> = ({ visible, mealName, onClose }) => {
  const [animation] = useState(new Animated.Value(0));
  const router = useRouter();

  useEffect(() => {
    if (visible) {
      // Slide in from top
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        // Auto hide after 4 seconds
        Animated.delay(10000),
        Animated.timing(animation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (visible) onClose();
      });
    }
  }, [visible]);

  const handleViewCart = () => {
    onClose();
    // Use requestAnimationFrame to defer navigation after state update
    requestAnimationFrame(() => {
      router.push('/order');
    });
  };

  const handleContinue = () => {
    onClose();
  };

  if (!visible) return null;

  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 50],
  });

  const opacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Animated.View
      className="absolute top-0 left-0 right-0 z-50"
      style={{
        transform: [{ translateY }],
        opacity,
      }}
    >
      <View className="mx-4 bg-white rounded-xl shadow-lg border border-gray-200">
        <View className="flex-row items-center p-4">
          {/* Success Icon */}
          <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
            <Ionicons name="checkmark" size={20} color="#10b981" />
          </View>

          {/* Message */}
          <View className="flex-1">
            <Text className="text-sm font-semibold text-gray-900">Added to Cart!</Text>
            <Text className="text-xs text-gray-600" numberOfLines={1}>
              {mealName}
            </Text>
          </View>

          {/* Close Button */}
          <TouchableOpacity onPress={handleContinue} className="p-1">
            <Ionicons name="close" size={18} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View className="flex-row border-t border-gray-100">
          <TouchableOpacity 
            onPress={handleContinue}
            className="flex-1 py-3 items-center border-r border-gray-100"
          >
            <Text className="text-sm text-gray-600 font-medium">Continue</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleViewCart}
            className="flex-1 py-3 items-center"
          >
            <Text className="text-sm font-medium" style={{ color: '#10b981' }}>View Cart</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}; 