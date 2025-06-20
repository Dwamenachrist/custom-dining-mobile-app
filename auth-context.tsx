import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

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
        // Here you would check for a token from AsyncStorage
        // For now, we simulate a small delay.
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (e) {
        console.error("Failed to check auth status", e);
      } finally {
        // Finished checking, tell the app to proceed with routing.
        setIsLoading(false);
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