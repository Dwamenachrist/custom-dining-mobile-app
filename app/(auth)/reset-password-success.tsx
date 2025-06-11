import { View, Text, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../components/Button';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

export default function ResetPasswordSuccessScreen() {
  const router = useRouter();

  const handleContinueToLogin = () => {
    // Navigate back to login screen
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      
      <View className="flex-1 px-6 justify-center">
        {/* Success Icon and Message */}
        <View className="items-center mb-12">
          <View className="w-24 h-24 rounded-full bg-green-100 items-center justify-center mb-8">
            <Ionicons name="checkmark-circle" size={60} color="#10B981" />
          </View>
          
          <Text className="text-3xl font-bold text-center mb-4 text-gray-800">
            Password Reset Successful!
          </Text>
          
          <Text className="text-base text-gray-500 text-center leading-6 px-4">
            Your password has been successfully updated. You can now sign in with your new password.
          </Text>
        </View>

        {/* Continue Button */}
        <View className="px-4">
          <Button
            title="Continue to Sign In"
            variant="primary"
            onPress={handleContinueToLogin}
          />
        </View>

        {/* Additional Info */}
        <View className="items-center mt-8">
          <View className="bg-green-50 border border-green-200 rounded-lg p-4 mx-4">
            <Text className="text-green-700 text-center text-sm">
              🎉 Great! Your account is now secure with your new password.
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
} 