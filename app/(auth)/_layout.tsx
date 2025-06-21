import { Stack } from 'expo-router';
import { colors } from '../../theme/colors';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.white },
      }}
    >
      <Stack.Screen name="customer-login" />
      <Stack.Screen name="customer-signup" />
      <Stack.Screen name="customer-onboard" />
      <Stack.Screen name="restaurant-login" />
      <Stack.Screen name="restaurant-signup" />
      <Stack.Screen name="restaurant-onboard" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password-success" />
      <Stack.Screen name="path" />
      <Stack.Screen name="verify-email" />
    </Stack>
  );
}