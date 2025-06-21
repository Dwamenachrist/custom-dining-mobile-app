import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface EmailVerificationToastProps {
  visible: boolean;
  email: string;
  onClose: () => void;
}

export const EmailVerificationToast: React.FC<EmailVerificationToastProps> = ({ 
  visible, 
  email, 
  onClose 
}) => {
  const [animation] = useState(new Animated.Value(0));

  console.log('🍞 EmailVerificationToast rendered with visible:', visible, 'email:', email);

  useEffect(() => {
    console.log('🍞 EmailVerificationToast useEffect triggered, visible:', visible);
    if (visible) {
      console.log('🍞 Starting toast animation...');
      // Slide in from top
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        // Auto hide after 6 seconds (longer for important message)
        Animated.delay(6000),
        Animated.timing(animation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        console.log('🍞 Toast animation completed, calling onClose');
        if (visible) onClose();
      });
    }
  }, [visible]);

  const handleClose = () => {
    console.log('🍞 Toast manually closed');
    onClose();
  };

  if (!visible) {
    console.log('🍞 Toast not visible, returning null');
    return null;
  }

  console.log('🍞 Toast is visible, rendering component');

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
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        elevation: 9999, // For Android
        transform: [{ translateY }],
        opacity,
      }}
    >
      <View style={{
        marginHorizontal: 16,
        backgroundColor: 'white',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb'
      }}>
        <View className="flex-row items-start p-4">
          {/* Email Icon */}
          <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3 mt-1">
            <Ionicons name="mail" size={20} color="#3b82f6" />
          </View>

          {/* Message */}
          <View className="flex-1">
            <Text className="text-sm font-semibold text-gray-900 mb-1">
              Email Verification Required
            </Text>
            <Text className="text-xs text-gray-600 leading-4 mb-2">
              We've sent a verification link to{' '}
              <Text className="font-medium text-gray-800">{email}</Text>
            </Text>
            <Text className="text-xs text-red-600 font-medium leading-4 mb-1">
              ⚠️ You must verify your email before you can sign in.
            </Text>
            <Text className="text-xs text-gray-500 leading-4">
              Check your inbox and click the link to activate your account.
            </Text>
          </View>

          {/* Close Button */}
          <TouchableOpacity onPress={handleClose} className="p-1">
            <Ionicons name="close" size={18} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Action Button */}
        <View className="border-t border-gray-100">
          <TouchableOpacity 
            onPress={handleClose}
            className="py-3 items-center"
          >
            <Text className="text-sm font-medium" style={{ color: '#3b82f6' }}>
              Got it!
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}; 