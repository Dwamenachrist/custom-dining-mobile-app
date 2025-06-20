import '../global.css';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../auth-context';
import { CartProvider } from '../cart-context';
import { useEffect, useRef, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomSplashScreen from './custom-splash';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: '(auth)',
};

// This component is the gatekeeper for our routes.
function RootLayoutNav() {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const [showCustomSplash, setShowCustomSplash] = useState(true);
  const [appReady, setAppReady] = useState(false);
  
  const [loaded] = useFonts({
    PoppinsRegular: require('../assets/fonts/Poppins-Regular.ttf'),
    PoppinsBold: require('../assets/fonts/Poppins-Bold.ttf'),
    SemiBold: require('../assets/fonts/Poppins-SemiBold.ttf'),
    Medium: require('../assets/fonts/Poppins-Medium.ttf'),
    Italic: require('../assets/fonts/Poppins-Italic.ttf')
  });

  useEffect(() => {
    // Prepare app resources
    if (loaded && !isLoading) {
      setAppReady(true);
      // Hide custom splash after 3.5 seconds (slightly longer than splash animation)
      setTimeout(() => {
        setShowCustomSplash(false);
      }, 3500);
    }
  }, [loaded, isLoading]);

  useEffect(() => {
    // We are still checking for a token, do nothing.
    if (isLoading || !appReady) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isTerms = segments[0] === 'customer-terms' || segments[0] === 'restaurant-terms';
    const isUploadCert = segments[0] === 'upload-certifications';
    const isMealPlanBuilder = segments[0] === 'meal-plan-builder';
    const isChangePassword = segments[0] === 'change-password';
    const isCustomerTabs = segments[0] === '(customer-tabs)';
    const isRestaurantTabs = segments[0] === '(restaurant-tabs)';
    const isCustomSplash = segments[0] === 'custom-splash';

    // Don't interfere with custom splash screen
    if (showCustomSplash || isCustomSplash) return;

    // If the user is logged in, but they are in the auth flow, redirect them.
    if (isLoggedIn && inAuthGroup) {
      // Check user type and redirect accordingly
      checkUserTypeAndRedirect();
    } 
    // If the user is not logged in and not in allowed screens, redirect them to auth.
    // Note: meal-plan-builder, terms pages, and change-password are accessible during onboarding/forgot password flow
    else if (!isLoggedIn && !inAuthGroup && !isTerms && !isUploadCert && !isMealPlanBuilder && !isChangePassword) {
      router.replace('/(auth)/path' as any);
    }
  }, [isLoading, isLoggedIn, segments, appReady, showCustomSplash]);

  const checkUserTypeAndRedirect = async () => {
    try {
      const userType = await AsyncStorage.getItem('userType');
      if (userType === 'customer') {
        router.replace('/(customer-tabs)/home');
      } else if (userType === 'restaurant') {
        router.replace('/(restaurant-tabs)/home');
      } else {
        // No user type stored, go to path screen
        router.replace('/(auth)/path');
      }
    } catch (error) {
      console.error('Error checking user type:', error);
      router.replace('/(auth)/path');
    }
  };

  // Show custom splash screen while app is loading or if explicitly showing
  if (!appReady || showCustomSplash) {
    return <CustomSplashScreen />;
  }

  // Once loading is complete, the router will handle showing the correct stack.
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="custom-splash" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(customer-tabs)" />
      <Stack.Screen name="(restaurant-tabs)" />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      <Stack.Screen name="customer-notifications" />
      <Stack.Screen name="restaurant-notifications" />
      <Stack.Screen name="checkout" />
      <Stack.Screen name="order-confirmation" />
      <Stack.Screen name="order-status" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="upload-certifications" />
      <Stack.Screen name="restaurants" />
      <Stack.Screen name="restaurant-profile" />
      <Stack.Screen name="customer-terms" />
      <Stack.Screen name="restaurant-terms" />
      <Stack.Screen name="meal/[id]" />
      <Stack.Screen name="meal/recommended" />
      <Stack.Screen name="add-meal" />
      <Stack.Screen name="meal-plan-builder" />
      <Stack.Screen name="change-password" />
      <Stack.Screen name="location-search" />
      <Stack.Screen name="breakfast" />
      <Stack.Screen name="lunch" />
      <Stack.Screen name="dinner" />
      <Stack.Screen name="snacks" />
      <Stack.Screen name="menu" />
      <Stack.Screen name="reviews" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <RootLayoutNav />
      </CartProvider>
    </AuthProvider>
  );
}