import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// You might use AsyncStorage for persistence in a real app
// import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean; // This is essential for the router
  setIsLoggedIn: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Start in a loading state

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
    <AuthContext.Provider value={{ isLoggedIn, isLoading, setIsLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}