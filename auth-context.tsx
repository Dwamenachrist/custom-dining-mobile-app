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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Start in a loading state
  const [user, setUser] = useState<User | null>(null);
  const [jwt, setJwt] = useState<string | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verificationGracePeriod, setVerificationGracePeriod] = useState<number | null>(null);

  // This effect runs on app startup to check for a saved session.
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        console.log('🔍 Auth Context: Checking authentication...');
        
        // Just check for token and login status - simplified
        const [token, loginStatus, userType, userName, userEmail] = await Promise.all([
          AsyncStorage.getItem('auth_token'),
          AsyncStorage.getItem('isLoggedIn'),
          AsyncStorage.getItem('userType'),
          AsyncStorage.getItem('userName'),
          AsyncStorage.getItem('userEmail')
        ]);
        
        console.log('🔍 Auth check:', { 
          hasToken: !!token, 
          loginStatus, 
          userType, 
          userName, 
          userEmail 
        });
        
        // Simple check: if we have token and login status is true
        if (token && loginStatus === 'true') {
          // Create user object if we have user info
          let userObj = null;
          if (userName || userEmail) {
            userObj = {
              id: userEmail || 'user',
              email: userEmail || '',
              role: userType || 'customer',
              isEmailVerified: true // Assume verified if logged in
            };
          }
          
          setIsLoggedIn(true);
          setUser(userObj);
          setJwt(token);
          setIsEmailVerified(true);
          
          console.log('✅ Auth restored:', { userType, hasUser: !!userObj });
        } else {
          console.log('ℹ️ No authentication found');
          setIsLoggedIn(false);
          setUser(null);
          setJwt(null);
          setIsEmailVerified(false);
        }
      } catch (e) {
        console.error("❌ Auth check failed:", e);
        setIsLoggedIn(false);
        setUser(null);
        setJwt(null);
        setIsEmailVerified(false);
      } finally {
        setIsLoading(false);
        console.log('✅ Auth check completed');
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
      setVerificationGracePeriod
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