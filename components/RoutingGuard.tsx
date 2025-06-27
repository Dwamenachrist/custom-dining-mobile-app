import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '../auth-context';

interface RoutingGuardProps {
  children: React.ReactNode;
}

export function RoutingGuard({ children }: RoutingGuardProps) {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    
    // If not logged in and trying to access protected routes
    if (!isLoggedIn && !inAuthGroup) {
      router.replace('/(auth)/path');
    }
    
    // If logged in and in auth routes (handled by index.tsx redirects)
    // Let the index.tsx handle proper routing based on user state
    
  }, [isLoggedIn, isLoading, segments]);

  return <>{children}</>;
}

// Simplified hook for basic auth checks
export function useAuthGuard() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  const requireAuth = () => {
    if (!isLoggedIn) {
      router.replace('/(auth)/path');
      return false;
    }
    return true;
  };

  return { requireAuth, isLoggedIn };
} 