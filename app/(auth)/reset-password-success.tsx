import { View, Text, SafeAreaView, StatusBar, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../components/Button';
import { colors } from '../../theme/colors';

export default function ResetPasswordSuccessScreen() {
  const router = useRouter();

  const handleContinueToLogin = () => {
    // Navigate back to login screen
    router.replace('/(auth)/customer-login');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      
      <View className="flex-1 px-6 justify-center">
        {/* Success Icon and Message */}
        <View className="items-center mb-12">
          <View className="w-24 h-24 rounded-full bg-green-100 items-center justify-center mb-8">
            <Image source={require('../../assets/password-reset.png')} className="w-[225px] h-[256px]" />
          </View>
          
          <Text className="text-3xl font-bold text-center mb-4 mt-[85px] text-gray-800">
            Password Reset
          </Text>
          
          <Text className="text-base text-gray-500 text-center leading-6 px-4">
            Your password has been changed successfully
          </Text>
        </View>

        {/* Continue Button */}
        <View className="px-4">
          <Button
            title="Login"
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