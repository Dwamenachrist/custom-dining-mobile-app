import React, { useEffect, useState } from 'react';
import { View, Text, Animated, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

interface ComingSoonToastProps {
  visible: boolean;
  feature: string;
  onClose: () => void;
  duration?: number;
}

export const ComingSoonToast: React.FC<ComingSoonToastProps> = ({ 
  visible, 
  feature, 
  onClose,
  duration = 3000 
}) => {
  const [animation] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      // Slide in from top with bounce effect
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        // Auto hide after specified duration
        Animated.delay(duration),
        Animated.timing(animation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (visible) onClose();
      });
    }
  }, [visible, duration]);

  const handleClose = () => {
    Animated.timing(animation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  if (!visible) {
    return null;
  }

  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 50],
  });

  const opacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const scale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        elevation: 9999,
        transform: [{ translateY }, { scale }],
        opacity,
      }}
    >
      <View style={{
        marginHorizontal: 16,
        backgroundColor: 'white',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        overflow: 'hidden',
      }}>
        {/* Gradient Header */}
        <View style={{
          backgroundColor: '#667eea',
          backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          paddingVertical: 16,
          paddingHorizontal: 20,
          position: 'relative',
        }}>
          {/* Decorative circles */}
          <View style={{
            position: 'absolute',
            top: -10,
            right: -10,
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          }} />
          <View style={{
            position: 'absolute',
            bottom: -5,
            left: -5,
            width: 25,
            height: 25,
            borderRadius: 12.5,
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
          }} />
          
          <View className="flex-row items-center justify-between">
            <View className="flex-1 flex-row items-center">
              <View style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}>
                <Ionicons name="rocket" size={20} color="white" />
              </View>
              <View className="flex-1">
                <Text style={{ 
                  fontSize: 16, 
                  fontWeight: '700', 
                  color: 'white',
                  letterSpacing: 0.5,
                }}>
                  Coming Soon!
                </Text>
                <Text style={{ 
                  fontSize: 12, 
                  color: 'rgba(255, 255, 255, 0.9)',
                  marginTop: 2,
                  letterSpacing: 0.3,
                }}>
                  We're working on something amazing
                </Text>
              </View>
            </View>

            <TouchableOpacity 
              onPress={handleClose}
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="close" size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View style={{
          paddingHorizontal: 20,
          paddingVertical: 16,
          backgroundColor: 'white',
        }}>
          <View className="flex-row items-center mb-3">
            <View style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: '#667eea',
              marginRight: 8,
            }} />
            <Text style={{ 
              fontSize: 14, 
              fontWeight: '600', 
              color: '#1f2937',
              flex: 1,
            }}>
              {feature}
            </Text>
          </View>
          
          <Text style={{ 
            fontSize: 13, 
            color: '#6b7280',
            lineHeight: 18,
            marginBottom: 12,
          }}>
            This feature is currently under development. We'll notify you when it's ready!
          </Text>

          {/* Progress indicator */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#f3f4f6',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 8,
          }}>
            <View style={{
              width: 16,
              height: 16,
              borderRadius: 8,
              backgroundColor: '#667eea',
              marginRight: 8,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <View style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: 'white',
              }} />
            </View>
            <Text style={{ 
              fontSize: 12, 
              color: '#667eea',
              fontWeight: '500',
              flex: 1,
            }}>
              In Development
            </Text>
            <Text style={{ 
              fontSize: 11, 
              color: '#9ca3af',
              fontWeight: '500',
            }}>
              75%
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}; 