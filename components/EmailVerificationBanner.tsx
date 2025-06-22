import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../auth-context';

interface EmailVerificationBannerProps {
  onResendEmail?: () => void;
}

export const EmailVerificationBanner: React.FC<EmailVerificationBannerProps> = ({ 
  onResendEmail 
}) => {
  const { user, isEmailVerified, verificationGracePeriod } = useAuth();
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isGracePeriodActive, setIsGracePeriodActive] = useState(true);

  useEffect(() => {
    if (!verificationGracePeriod || isEmailVerified) {
      setIsGracePeriodActive(false);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const timeRemaining = verificationGracePeriod - now;

      if (timeRemaining <= 0) {
        setIsGracePeriodActive(false);
        setTimeLeft('');
        return;
      }

      const minutes = Math.floor(timeRemaining / 60000);
      const seconds = Math.floor((timeRemaining % 60000) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    // Update immediately
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [verificationGracePeriod, isEmailVerified]);

  // Don't show banner if email is verified or no user
  if (!user || isEmailVerified) {
    return null;
  }

  return (
    <View style={{
      backgroundColor: '#fef3c7', // Light yellow background
      borderLeftWidth: 4,
      borderLeftColor: '#f59e0b', // Orange accent
      paddingHorizontal: 16,
      paddingVertical: 12,
      margin: 16,
      borderRadius: 8,
    }}>
      <View className="flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center">
          <Ionicons name="warning" size={20} color="#f59e0b" style={{ marginRight: 8 }} />
          <View className="flex-1">
            <Text style={{ 
              fontSize: 14, 
              fontWeight: '600', 
              color: '#92400e',
              marginBottom: 2 
            }}>
              Verify your email
            </Text>
            <Text style={{ 
              fontSize: 12, 
              color: '#92400e',
              lineHeight: 16 
            }}>
              {isGracePeriodActive && timeLeft ? (
                `${timeLeft} left to explore freely. Verify to continue using all features.`
              ) : (
                'Please verify your email to access all features.'
              )}
            </Text>
          </View>
        </View>

        {onResendEmail && (
          <TouchableOpacity 
            onPress={onResendEmail}
            style={{
              backgroundColor: '#f59e0b',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 6,
              marginLeft: 8,
            }}
          >
            <Text style={{ 
              color: 'white', 
              fontSize: 12, 
              fontWeight: '600' 
            }}>
              Resend
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}; 