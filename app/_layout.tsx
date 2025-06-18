import '../global.css';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../auth-context';
import { useEffect, useRef } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const splashHidden = useRef(false);
  
  const [loaded] = useFonts({
    PoppinsRegular: require('../assets/fonts/Poppins-Regular.ttf'),
    PoppinsBold: require('../assets/fonts/Poppins-Bold.ttf'),
    SemiBold: require('../assets/fonts/Poppins-SemiBold.ttf'),
    Medium: require('../assets/fonts/Poppins-Medium.ttf'),
    Italic: require('../assets/fonts/Poppins-Italic.ttf')
  });

  useEffect(() => {
    // Hide the splash screen once fonts are loaded and auth state is determined
    if (loaded && !isLoading && !splashHidden.current) {
      // Add a small delay to ensure smooth transition
      const timer = setTimeout(() => {
        SplashScreen.hideAsync();
        splashHidden.current = true;
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [loaded, isLoading]);

  useEffect(() => {
    // We are still checking for a token, do nothing.
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isTerms = segments[0] === 'terms';
    const isUploadCert = segments[0] === 'upload-certifications';
    const isCustomerTabs = segments[0] === '(customer-tabs)';
    const isRestaurantTabs = segments[0] === '(restaurant-tabs)';

    // If the user is logged in, but they are in the auth flow, redirect them.
    if (isLoggedIn && inAuthGroup) {
      // Check user type and redirect accordingly
      checkUserTypeAndRedirect();
    } 
    // If the user is not logged in and not in the auth group, and not on /terms or /upload-certifications, redirect them.
    // Note: meal-plan-builder should only be accessible after login and email verification
    else if (!isLoggedIn && !inAuthGroup && !isTerms && !isUploadCert) {
      router.replace('/(auth)/path' as any);
    }
  }, [isLoading, isLoggedIn, segments]);

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

  // While the auth state is loading or fonts are loading, show a spinner.
  if (isLoading || !loaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F0' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Once loading is complete, the router will handle showing the correct stack.
  return (
    <Stack screenOptions={{ headerShown: false }}>
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
      <Stack.Screen name="terms" />
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
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}