import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

interface NotificationToastProps {
  visible: boolean;
  message: string;
  type: 'success' | 'error' | 'cart';
  onHide: () => void;
  actionText?: string;
  onActionPress?: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ 
  visible, 
  message, 
  type, 
  onHide, 
  actionText, 
  onActionPress 
}) => {
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
        Animated.delay(4000),
        Animated.timing(animation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (visible) onHide();
      });
    }
  }, [visible]);

  const handleActionPress = () => {
    onHide();
    if (onActionPress) {
      // Use requestAnimationFrame to defer navigation after state update
      requestAnimationFrame(() => {
        onActionPress();
      });
    }
  };

  const handleClose = () => {
    onHide();
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

  const getIconName = () => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'close-circle';
      case 'cart':
        return 'cart';
      default:
        return 'information-circle';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return '#10b981';
      case 'error':
        return '#ef4444';
      case 'cart':
        return colors.primary;
      default:
        return '#6b7280';
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#ecfdf5';
      case 'error':
        return '#fef2f2';
      case 'cart':
        return '#f0f9ff';
      default:
        return '#f9fafb';
    }
  };

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left: 16,
        right: 16,
        zIndex: 1000,
        transform: [{ translateY }],
        opacity,
      }}
    >
      <View style={{
        backgroundColor: 'white',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderLeftWidth: 4,
        borderLeftColor: getIconColor(),
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 16,
        }}>
          {/* Icon */}
          <View style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: getBackgroundColor(),
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}>
            <Ionicons name={getIconName() as any} size={20} color={getIconColor()} />
          </View>

          {/* Message */}
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: 2,
            }}>
              {type === 'cart' ? 'Added to Cart!' : type === 'success' ? 'Success!' : 'Error'}
            </Text>
            <Text style={{
              fontSize: 13,
              color: '#6b7280',
              lineHeight: 18,
            }}>
              {message}
            </Text>
          </View>

          {/* Close Button */}
          <TouchableOpacity onPress={handleClose} style={{ padding: 4 }}>
            <Ionicons name="close" size={18} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        {actionText && onActionPress && (
          <View style={{
            flexDirection: 'row',
            borderTopWidth: 1,
            borderTopColor: '#f3f4f6',
          }}>
            <TouchableOpacity 
              onPress={handleClose}
              style={{
                flex: 1,
                paddingVertical: 12,
                alignItems: 'center',
                borderRightWidth: 1,
                borderRightColor: '#f3f4f6',
              }}
            >
              <Text style={{
                fontSize: 14,
                color: '#6b7280',
                fontWeight: '500',
              }}>
                Continue
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleActionPress}
              style={{
                flex: 1,
                paddingVertical: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: colors.primary,
              }}>
                {actionText}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Animated.View>
  );
}; 