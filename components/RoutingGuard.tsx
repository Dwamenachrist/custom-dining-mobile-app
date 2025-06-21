import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../auth-context';

interface RoutingGuardProps {
  requiresProfile?: boolean;
  redirectTo?: string;
  children: React.ReactNode;
}

export function RoutingGuard({ 
  requiresProfile = true, 
  redirectTo = '/meal-plan-builder',
  children 
}: RoutingGuardProps) {
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    checkUserState();
  }, [isLoggedIn]);

  const checkUserState = async () => {
    try {
      // If user is not logged in, redirect to auth
      if (!isLoggedIn) {
        console.log('🚫 User not logged in - redirecting to auth');
        router.replace('/(auth)/path');
        return;
      }

      // Check profile completion if required
      if (requiresProfile) {
        const hasUserProfile = await AsyncStorage.getItem('hasUserProfile') === 'true';
        
        if (!hasUserProfile) {
          console.log('🍽️ User profile incomplete - redirecting to meal plan builder');
          router.replace(redirectTo);
          return;
        }
      }

      // Check for force password change
      const forcePasswordChange = await AsyncStorage.getItem('forcePasswordChange') === 'true';
      if (forcePasswordChange) {
        console.log('🔒 Force password change required');
        router.replace('/change-password');
        return;
      }

      // Check email verification
      const isEmailVerified = await AsyncStorage.getItem('isEmailVerified') === 'true';
      if (!isEmailVerified) {
        console.log('📧 Email not verified - redirecting to verification');
        router.replace('/(auth)/verify-email');
        return;
      }

    } catch (error) {
      console.error('❌ Error in routing guard:', error);
    }
  };

  return <>{children}</>;
}

// Hook for easy routing checks
export function useRoutingGuard() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  const checkAndRedirect = async (requiresProfile: boolean = true) => {
    try {
      if (!isLoggedIn) {
        router.replace('/(auth)/path');
        return false;
      }

      const forcePasswordChange = await AsyncStorage.getItem('forcePasswordChange') === 'true';
      if (forcePasswordChange) {
        router.replace('/change-password');
        return false;
      }

      const isEmailVerified = await AsyncStorage.getItem('isEmailVerified') === 'true';
      if (!isEmailVerified) {
        router.replace('/(auth)/verify-email');
        return false;
      }

      if (requiresProfile) {
        const hasUserProfile = await AsyncStorage.getItem('hasUserProfile') === 'true';
        if (!hasUserProfile) {
          router.replace('/meal-plan-builder');
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('❌ Error in routing check:', error);
      return false;
    }
  };

  return { checkAndRedirect };
} 