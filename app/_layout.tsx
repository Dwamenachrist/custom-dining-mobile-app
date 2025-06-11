import '../global.css';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../auth-context';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(auth)',
};

// This component is the gatekeeper for our routes.
function RootLayoutNav() {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // We are still checking for a token, do nothing.
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    // If the user is logged in, but they are in the auth flow, redirect them.
    if (isLoggedIn && inAuthGroup) {
      router.replace('/(tabs)/home');
    } 
    // If the user is not logged in and not in the auth group, redirect them.
    else if (!isLoggedIn && !inAuthGroup) {
      router.replace('/(auth)/onboarding');
    }
  }, [isLoading, isLoggedIn, segments]);

  // While the auth state is loading, show a spinner.
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Once loading is complete, the router will handle showing the correct stack.
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
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