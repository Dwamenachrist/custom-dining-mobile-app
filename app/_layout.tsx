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
      console.log('📱 App ready, hiding splash in 3.5s');
      
      // Hide custom splash after 3.5 seconds (slightly longer than splash animation)
      const splashTimeout = setTimeout(() => {
        console.log('🎬 Hiding custom splash screen');
        setShowCustomSplash(false);
      }, 3500);

      return () => clearTimeout(splashTimeout);
    }
  }, [loaded, isLoading]);

  // Failsafe: If splash has been showing for too long, force hide it
  useEffect(() => {
    const failsafeTimeout = setTimeout(() => {
      if (showCustomSplash) {
        console.log('⚠️ Failsafe: Force hiding splash screen after 10 seconds');
        setShowCustomSplash(false);
        setAppReady(true);
      }
    }, 10000); // 10 second failsafe

    return () => clearTimeout(failsafeTimeout);
  }, []);

  useEffect(() => {
    // Don't do anything while loading or showing splash
    if (isLoading || !appReady || showCustomSplash) {
      console.log('⏳ Still loading:', { isLoading, appReady, showCustomSplash });
      return;
    }

    const currentSegment = segments[0];
    console.log('🔄 Router check:', { isLoggedIn, currentSegment, segments });

    // Define allowed screens for different states
    const publicScreens = ['(auth)', 'customer-terms', 'restaurant-terms'];
    const onboardingScreens = ['meal-plan-builder', 'change-password', 'upload-certifications'];
    const authScreens = ['(customer-tabs)', '(restaurant-tabs)'];

    // If user is logged in but in auth screens, redirect appropriately
    if (isLoggedIn && currentSegment === '(auth)') {
      console.log('✅ Logged in user in auth - redirecting');
      checkUserStateAndRedirect();
      return;
    }

    // If user is not logged in and trying to access protected screens
    if (!isLoggedIn && !publicScreens.includes(currentSegment) && !onboardingScreens.includes(currentSegment)) {
      console.log('❌ Not logged in - redirecting to auth');
      router.replace('/(auth)/path');
      return;
    }

    // If we're at the root level and user is logged in, redirect appropriately
    if (isLoggedIn && (!currentSegment || currentSegment === 'custom-splash')) {
      console.log('🏠 At root with logged in user - redirecting');
      checkUserStateAndRedirect();
      return;
    }

  }, [isLoading, isLoggedIn, segments, appReady, showCustomSplash]);

  const checkUserStateAndRedirect = async () => {
    try {
      const userType = await AsyncStorage.getItem('userType');
      const hasUserProfile = await AsyncStorage.getItem('hasUserProfile') === 'true';
      const forcePasswordChange = await AsyncStorage.getItem('forcePasswordChange') === 'true';
      
      console.log('🔍 Simple state check:', { userType, hasUserProfile, forcePasswordChange });

      // Force password change takes priority
      if (forcePasswordChange) {
        console.log('🔒 Redirecting to change password');
        router.replace('/change-password');
        return;
      }

      // Check user type and profile
      if (userType === 'customer') {
        if (!hasUserProfile) {
          console.log('🍽️ Customer needs profile setup');
          router.replace('/meal-plan-builder');
        } else {
          console.log('🏠 Customer home');
          router.replace('/(customer-tabs)/home');
        }
      } else if (userType === 'restaurant') {
        console.log('🏪 Restaurant home');
        router.replace('/(restaurant-tabs)/home');
      } else {
        console.log('❓ No user type - path selection');
        router.replace('/(auth)/path');
      }
    } catch (error) {
      console.error('❌ Redirect error:', error);
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