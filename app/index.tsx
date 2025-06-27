import { Redirect } from 'expo-router';
import { useAuth } from '../auth-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export default function IndexScreen() {
  const { isLoggedIn, isLoading } = useAuth();
  const [userType, setUserType] = useState<string | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      checkUserState();
    }
  }, [isLoading]);

  const checkUserState = async () => {
    try {
      const [type, profile] = await Promise.all([
        AsyncStorage.getItem('userType'),
        AsyncStorage.getItem('hasUserProfile')
      ]);
      
      setUserType(type);
      setHasProfile(profile === 'true');
      setIsReady(true);
    } catch (error) {
      console.error('Error checking user state:', error);
      setIsReady(true);
    }
  };

  // Don't render anything while loading
  if (isLoading || !isReady) {
    return null;
  }

  // Simple redirect logic
  if (!isLoggedIn) {
    return <Redirect href="/(auth)/path" />;
  }

  if (userType === 'customer') {
    if (hasProfile) {
      return <Redirect href="/(customer-tabs)/home" />;
    } else {
      return <Redirect href="/meal-plan-builder" />;
    }
  }

  if (userType === 'restaurant') {
    return <Redirect href="/(restaurant-tabs)/home" />;
  }

  // Fallback
  return <Redirect href="/(auth)/path" />;
} 