import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface MealPlanToastProps {
  visible: boolean;
  message: string;
  type: 'success' | 'error' | 'cart';
  onHide: () => void;
  actionText?: string;
  onActionPress?: () => void;
}

export default function MealPlanToast({ 
  visible, 
  message, 
  type, 
  onHide, 
  actionText, 
  onActionPress 
}: MealPlanToastProps) {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        hideToast();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  const getToastStyle = () => {
    switch (type) {
      case 'success':
        return { backgroundColor: '#10B981', icon: 'checkmark-circle' as const };
      case 'error':
        return { backgroundColor: '#EF4444', icon: 'alert-circle' as const };
      case 'cart':
        return { backgroundColor: colors.primary, icon: 'bag-add' as const };
      default:
        return { backgroundColor: colors.primary, icon: 'information-circle' as const };
    }
  };

  const toastStyle = getToastStyle();

  if (!visible) return null;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 60,
        left: 16,
        right: 16,
        zIndex: 1000,
        transform: [{ translateY: slideAnim }],
        opacity: opacityAnim,
      }}
    >
      <View
        style={{
          backgroundColor: toastStyle.backgroundColor,
          borderRadius: 12,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Ionicons name={toastStyle.icon} size={24} color="white" style={{ marginRight: 12 }} />
        
        <Text
          style={{
            flex: 1,
            color: 'white',
            fontSize: 14,
            fontWeight: '500',
            lineHeight: 20,
          }}
          numberOfLines={2}
        >
          {message}
        </Text>

        {actionText && onActionPress && (
          <TouchableOpacity
            onPress={onActionPress}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
              marginLeft: 12,
            }}
          >
            <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
              {actionText}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={hideToast} style={{ marginLeft: 8, padding: 4 }}>
          <Ionicons name="close" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}
