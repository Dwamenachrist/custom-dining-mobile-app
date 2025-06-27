import '../global.css';
import { Stack } from 'expo-router';
import { AuthProvider } from '../auth-context';
import { CartProvider } from '../cart-context';
import { NotificationProvider } from '../notification-context';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import CustomSplashScreen from './custom-splash';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// REMOVED: Deprecated unstable_settings that was causing routing issues
// export const unstable_settings = {
//   initialRouteName: '(auth)',
// };

// This component is the gatekeeper for our routes.
function RootLayoutNav() {
  const [showCustomSplash, setShowCustomSplash] = useState(true);
  
  const [loaded] = useFonts({
    PoppinsRegular: require('../assets/fonts/Poppins-Regular.ttf'),
    PoppinsBold: require('../assets/fonts/Poppins-Bold.ttf'),
    SemiBold: require('../assets/fonts/Poppins-SemiBold.ttf'),
    Medium: require('../assets/fonts/Poppins-Medium.ttf'),
    Italic: require('../assets/fonts/Poppins-Italic.ttf')
  });

  useEffect(() => {
    if (loaded) {
      console.log('📱 Fonts loaded, hiding splash in 3.5s');
      
      // Hide custom splash after 3.5 seconds
      const splashTimeout = setTimeout(() => {
        console.log('🎬 Hiding custom splash screen');
        setShowCustomSplash(false);
        SplashScreen.hideAsync();
      }, 3500);

      return () => clearTimeout(splashTimeout);
    }
  }, [loaded]);

  // Show splash while fonts load
  if (!loaded) {
    return null;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
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
      
      {/* Show splash screen as overlay when needed */}
      {showCustomSplash && (
        <View style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          zIndex: 1000 
        }}>
          <CustomSplashScreen />
        </View>
      )}
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <NotificationProvider>
      <CartProvider>
        <RootLayoutNav />
      </CartProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}