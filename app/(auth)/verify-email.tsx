import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button } from '../../components/Button';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import AuthService from '../../services/authService';

export default function VerifyEmailScreen() {
    const router = useRouter();
    const { token } = useLocalSearchParams<{ token: string }>();
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');
    const [isTokenValid, setIsTokenValid] = useState(true);

    useEffect(() => {
        if (!token) {
            setError('Verification token is missing. Please use the link from your email.');
            setIsTokenValid(false);
            setIsLoading(false);
            return;
        }

        verifyEmailToken();
    }, [token]);

    const verifyEmailToken = async () => {
        try {
            console.log('📧 Verifying email with token:', token);

            const response = await AuthService.verifyEmail(token);

            if (response.success) {
                console.log('✅ Email verified successfully');
                setIsSuccess(true);
            } else {
                console.log('❌ Email verification failed:', response.message);
                setError(response.message || 'Failed to verify email. Please try again.');
            }
        } catch (error) {
            console.error('❌ Verify email error:', error);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToLogin = () => {
        router.replace('/(auth)/customer-login');
    };

    const handleResendEmail = () => {
        // TODO: Implement resend verification email functionality
        console.log('📧 Resend verification email');
        router.replace('/(auth)/customer-login');
    };

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-lightGray">
                <StatusBar barStyle="dark-content" />

                {/* Header */}
                <View className="flex-row items-center p-6 pt-12">
                    <TouchableOpacity onPress={handleBackToLogin} className="mr-4">
                        <Ionicons name="arrow-back" size={24} color={colors.darkGray} />
                    </TouchableOpacity>
                </View>

                <View className="flex-1 px-6 justify-center">
                    <View className="items-center mb-8">
                        <View className="w-24 h-24 bg-blue-50 rounded-full items-center justify-center mb-6">
                            <Ionicons name="mail" size={48} color="#3B82F6" />
                        </View>
                    </View>

                    <View className="mb-8">
                        <Text className="text-2xl font-bold text-center text-gray-800 mb-4">
                            Verifying Your Email
                        </Text>
                        <Text className="text-base text-center text-gray-500 leading-6">
                            Please wait while we verify your email address...
                        </Text>
                    </View>

                    {/* Loading indicator */}
                    <View className="items-center">
                        <View className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></View>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    if (!isTokenValid) {
        return (
            <SafeAreaView className="flex-1 bg-lightGray">
                <StatusBar barStyle="dark-content" />

                {/* Header */}
                <View className="flex-row items-center p-6 pt-12">
                    <TouchableOpacity onPress={handleBackToLogin} className="mr-4">
                        <Ionicons name="arrow-back" size={24} color={colors.darkGray} />
                    </TouchableOpacity>
                </View>

                <View className="flex-1 px-6 justify-center">
                    <View className="items-center mb-8">
                        <View className="w-24 h-24 bg-red-50 rounded-full items-center justify-center mb-6">
                            <Ionicons name="alert-circle" size={48} color="#DC2626" />
                        </View>
                    </View>

                    <View className="mb-8">
                        <Text className="text-2xl font-bold text-center text-gray-800 mb-4">
                            Invalid Verification Link
                        </Text>
                        <Text className="text-base text-center text-gray-500 leading-6">
                            The email verification link is invalid or has expired. Please request a new verification email.
                        </Text>
                    </View>

                    <Button
                        title="Back to Login"
                        variant="primary"
                        onPress={handleBackToLogin}
                    />
                </View>
            </SafeAreaView>
        );
    }

    if (isSuccess) {
        return (
            <SafeAreaView className="flex-1 bg-lightGray">
                <StatusBar barStyle="dark-content" />

                {/* Header */}
                <View className="flex-row items-center p-6 pt-12">
                    <TouchableOpacity onPress={handleBackToLogin} className="mr-4">
                        <Ionicons name="arrow-back" size={24} color={colors.darkGray} />
                    </TouchableOpacity>
                </View>

                <View className="flex-1 px-6 justify-center">
                    <View className="items-center mb-8">
                        <View className="w-24 h-24 bg-green-50 rounded-full items-center justify-center mb-6">
                            <Ionicons name="checkmark-circle" size={48} color="#10B981" />
                        </View>
                    </View>

                    <View className="mb-8">
                        <Text className="text-2xl font-bold text-center text-gray-800 mb-4">
                            Email Verified Successfully
                        </Text>
                        <Text className="text-base text-center text-gray-500 leading-6">
                            Your email has been verified successfully. You can now log in to your account.
                        </Text>
                    </View>

                    <Button
                        title="Continue to Login"
                        variant="primary"
                        onPress={handleBackToLogin}
                    />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-lightGray">
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View className="flex-row items-center p-6 pt-12">
                <TouchableOpacity onPress={handleBackToLogin} className="mr-4">
                    <Ionicons name="arrow-back" size={24} color={colors.darkGray} />
                </TouchableOpacity>
            </View>

            <View className="flex-1 px-6 justify-center">
                <View className="items-center mb-8">
                    <View className="w-24 h-24 bg-red-50 rounded-full items-center justify-center mb-6">
                        <Ionicons name="alert-circle" size={48} color="#DC2626" />
                    </View>
                </View>

                <View className="mb-8">
                    <Text className="text-2xl font-bold text-center text-gray-800 mb-4">
                        Verification Failed
                    </Text>
                    <Text className="text-base text-center text-gray-500 leading-6 mb-4">
                        {error || 'Failed to verify your email. The link may have expired or be invalid.'}
                    </Text>
                </View>

                <View className="space-y-4">
                    <Button
                        title="Back to Login"
                        variant="primary"
                        onPress={handleBackToLogin}
                    />
                    
                    <Button
                        title="Resend Verification Email"
                        variant="outline"
                        onPress={handleResendEmail}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
} 