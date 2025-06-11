import { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../components/Button';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const [selectedMethod, setSelectedMethod] = useState<'mobile' | 'email' | null>(null);

    const handleMethodSelect = (method: 'mobile' | 'email') => {
        setSelectedMethod(method);
    };

    const handleContinue = () => {
        if (selectedMethod === 'mobile') {
            router.push('/(auth)/forgot-password-mobile');
        } else if (selectedMethod === 'email') {
            router.push('/(auth)/forgot-password-email');
        }
    };

    const handleBackToLogin = () => {
        router.back();
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" />

            {/* Header with Back Button */}
            <View className="flex-row items-center p-6 pt-12">
                <TouchableOpacity onPress={handleBackToLogin} className="mr-4">
                    <Ionicons name="arrow-back" size={24} color={colors.darkGray} />
                </TouchableOpacity>
            </View>

            <View className="flex-1 px-6">
                {/* Illustration */}
                <View className="items-center mt-8">
                    <View className="items-center justify-center mb-4">
                        <Image
                            source={require('../../assets/forgot-password.png')}
                            className="w-286 h-286"
                            resizeMode="contain"
                        />
                    </View>
                </View>

                {/* Title and Subtitle */}
                <View className="mb-12">
                    <Text className="text-2xl font-bold text-center text-gray-800 mb-2">
                        Forgot Your Password?
                    </Text>
                    <Text className="text-base text-center text-gray-500">
                        Choose the method to receive OTP
                    </Text>
                </View>

                {/* Method Selection Options */}
                <View className="space-y-4 mb-12">
                    {/* Via Mobile Number */}
                    <TouchableOpacity
                        onPress={() => handleMethodSelect('mobile')}
                        className="flex-row items-center p-4">
                        <View className={`w-6 h-6 rounded-full border-2 mr-4 items-center justify-center ${selectedMethod === 'mobile'
                                ? 'border-green-500 bg-green-500'
                                : 'border-gray-300'
                            }`}>
                            {selectedMethod === 'mobile' && (
                                <Ionicons name="checkmark" size={14} color="white" />
                            )}
                        </View>
                        <View className="flex-1">
                            <Text className={`text-lg font-semibold mb-1 ${selectedMethod === 'mobile' ? 'text-green-600' : 'text-gray-800'
                                }`}>
                                VIA MOBILE NUMBER
                            </Text>
                            <Text className="text-sm text-gray-500">
                                We will send you the OTP via SMS.
                            </Text>
                        </View>
                    </TouchableOpacity>

                    {/* Via Email */}
                    <TouchableOpacity
                        onPress={() => handleMethodSelect('email')}
                        className="flex-row items-center p-4">
                        <View className={`w-6 h-6 rounded-full border-2 mr-4 items-center justify-center ${selectedMethod === 'email'
                                ? 'border-green-500 bg-green-500'
                                : 'border-gray-300'
                            }`}>
                            {selectedMethod === 'email' && (
                                <Ionicons name="checkmark" size={14} color="white" />
                            )}
                        </View>
                        <View className="flex-1">
                            <Text className={`text-lg font-semibold mb-1 ${selectedMethod === 'email' ? 'text-green-600' : 'text-gray-800'
                                }`}>
                                VIA EMAIL
                            </Text>
                            <Text className="text-sm text-gray-500">
                                We will send you the OTP via email.
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Continue Button */}
                <View className="mt-auto mb-8">
                    <Button
                        title="Send Verification Code"
                        variant="primary"
                        onPress={handleContinue}
                        disabled={!selectedMethod}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
} 