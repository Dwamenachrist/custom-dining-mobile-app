import { Link, Stack, useRouter } from 'expo-router';
import { Text, View, TouchableOpacity } from 'react-native';
import { useAuth } from '../auth-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export default function NotFoundScreen() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    // Get user type to provide appropriate navigation
    AsyncStorage.getItem('userType').then(setUserType);
  }, []);

  const handleGoHome = async () => {
    try {
      if (!isLoggedIn) {
        router.replace('/(auth)/path');
        return;
      }

      const userType = await AsyncStorage.getItem('userType');
      const hasUserProfile = await AsyncStorage.getItem('hasUserProfile') === 'true';

      if (userType === 'customer') {
        if (hasUserProfile) {
          router.replace('/(customer-tabs)/home');
        } else {
          router.replace('/meal-plan-builder');
        }
      } else if (userType === 'restaurant') {
        router.replace('/(restaurant-tabs)/home');
      } else {
        router.replace('/(auth)/path');
      }
    } catch (error) {
      console.error('Error navigating home:', error);
      router.replace('/(auth)/path');
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Page Not Found' }} />
      <View className={styles.container}>
        <Text className={styles.title}>This screen doesn't exist.</Text>
        <Text className={styles.subtitle}>
          The page you're looking for might have been moved or doesn't exist.
        </Text>
        
        <TouchableOpacity onPress={handleGoHome} className={styles.button}>
          <Text className={styles.buttonText}>
            {isLoggedIn 
              ? (userType === 'customer' ? 'Go to Customer Home' : 
                 userType === 'restaurant' ? 'Go to Restaurant Home' : 'Go Home')
              : 'Go to Login'
            }
          </Text>
        </TouchableOpacity>

        <Link href="/(auth)/path" className={styles.link}>
          <Text className={styles.linkText}>Or go to main menu</Text>
        </Link>
      </View>
    </>
  );
}

const styles = {
  container: `items-center flex-1 justify-center p-5 bg-white`,
  title: `text-xl font-bold text-gray-800 mb-2`,
  subtitle: `text-base text-gray-600 text-center mb-6`,
  button: `bg-blue-500 px-6 py-3 rounded-lg mb-4`,
  buttonText: `text-white font-semibold text-base`,
  link: `mt-4 pt-4`,
  linkText: `text-base text-blue-600 underline`,
};
