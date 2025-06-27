import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// You might use AsyncStorage for persistence in a real app
// import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  role: string;
  restaurantId?: string;
  isEmailVerified?: boolean;
  hasProfile?: boolean; // Whether user has completed dietary preferences setup
  forcePasswordChange?: boolean;
}

interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean; // This is essential for the router
  user: User | null;
  jwt: string | null;
  isEmailVerified: boolean;
  verificationGracePeriod: number | null; // timestamp when grace period ends
  setIsLoggedIn: (value: boolean) => void;
  setUser: (user: User | null) => void;
  setJwt: (jwt: string | null) => void;
  setIsEmailVerified: (verified: boolean) => void;
  setVerificationGracePeriod: (timestamp: number | null) => void;
  refreshAuthState: () => Promise<void>; // Add method to refresh auth state
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Start in a loading state
  const [user, setUser] = useState<User | null>(null);
  const [jwt, setJwt] = useState<string | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verificationGracePeriod, setVerificationGracePeriod] = useState<number | null>(null);

  // Refresh auth state from storage
  const refreshAuthState = async () => {
    try {
      console.log('🔄 Refreshing auth state...');
      
      const [token, loginStatus, userType, userName, userEmail, emailVerified] = await Promise.all([
        AsyncStorage.getItem('auth_token'),
        AsyncStorage.getItem('isLoggedIn'),
        AsyncStorage.getItem('userType'),
        AsyncStorage.getItem('userName'),
        AsyncStorage.getItem('userEmail'),
        AsyncStorage.getItem('isEmailVerified')
      ]);
      
      console.log('🔍 Auth state check:', { 
        hasToken: !!token, 
        loginStatus, 
        userType, 
        userName, 
        userEmail,
        emailVerified
      });
      
      if (token && loginStatus === 'true') {
        let userObj = null;
        if (userName || userEmail) {
          userObj = {
            id: userEmail || 'user',
            email: userEmail || '',
            role: userType === 'customer' ? 'user' : 'restaurant',
            isEmailVerified: emailVerified === 'true'
          };
        }
        
        setIsLoggedIn(true);
        setUser(userObj);
        setJwt(token);
        setIsEmailVerified(emailVerified === 'true');
        
        console.log('✅ Auth state restored:', { userType, hasUser: !!userObj });
      } else {
        console.log('ℹ️ No valid authentication found');
        setIsLoggedIn(false);
        setUser(null);
        setJwt(null);
        setIsEmailVerified(false);
      }
    } catch (e) {
      console.error("❌ Auth state refresh failed:", e);
      setIsLoggedIn(false);
      setUser(null);
      setJwt(null);
      setIsEmailVerified(false);
    }
  };

  // Initial auth check on app startup
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        console.log('🚀 Initial auth check...');
        await refreshAuthState();
      } catch (e) {
        console.error("❌ Initial auth check failed:", e);
        setIsLoggedIn(false);
        setUser(null);
        setJwt(null);
        setIsEmailVerified(false);
      } finally {
        // Small delay to ensure all state updates are complete
        setTimeout(() => {
          setIsLoading(false);
          console.log('✅ Auth initialization completed');
        }, 100);
      }
    };

    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      isLoading, 
      user, 
      jwt, 
      isEmailVerified,
      verificationGracePeriod,
      setIsLoggedIn, 
      setUser, 
      setJwt,
      setIsEmailVerified,
      setVerificationGracePeriod,
      refreshAuthState
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

// Export AuthContext for direct use
export { AuthContext };