import { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../components/Button';
import { TextInput } from '../../components/TextInput';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import AuthService from '../../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Validation helper
    const isEmailValid = email.includes('@') && email.includes('.');

    const handleSubmit = async () => {
        setError('');
        setIsLoading(true);
        
        try {
            if (!email) {
                setError('Please enter your email address.');
                return;
            }

            if (!isEmailValid) {
                setError('Please enter a valid email address.');
                return;
            }

            console.log('📧 Sending forgot password request for:', email);

            const response = await AuthService.forgotPassword(email);

            if (response.success) {
                console.log('✅ Forgot password email sent successfully');
                
                // Proceed to success screen
                setIsSuccess(true);
                await AsyncStorage.setItem('forgot_password_email', email);
            } else {
                // Display the actual backend error message (same pattern as customer-signup.tsx)
                console.log('Backend error response:', response);
                setError(response.message || response.error || 'Failed to send temporary password. Please try again.');
            }
        } catch (err: any) {
            const error = err;
            console.error('❌ Forgot password error:', error);
            
            // Check if it's a structured error response (same pattern as customer-signup.tsx)
            if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else if (error.message) {
                setError(error.message);
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToLogin = () => {
        router.replace('/(auth)/customer-login');
    };

    const handleGoToChangePassword = () => {
        // Navigate to change password screen with parameter to indicate it's from forgot password flow
        router.push('/change-password?fromForgotPassword=true');
    };

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

                <View className="flex-1 px-6">
                    {/* Success Illustration */}
                    <View className="items-center mt-8">
                        <View className="items-center justify-center mb-4">
                            <Image
                                source={require('../../assets/email-recovery.png')}
                                className="w-286 h-286"
                                resizeMode="contain"
                            />
                        </View>
                    </View>

                    {/* Success Message */}
                    <View className="mb-12">
                        <Text className="text-2xl font-bold text-center text-gray-800 mb-4">
                            Check Your Email
                        </Text>
                        <Text className="text-base text-center text-gray-500 leading-6 mb-4">
                            We've sent a temporary password to{' '}
                            <Text className="font-semibold text-gray-800">{email}</Text>
                        </Text>
                        
                        {/* Step-by-step instructions */}
                        <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <Text className="text-sm font-semibold text-blue-800 mb-2">📧 Next Steps:</Text>
                            <Text className="text-sm text-blue-700 mb-1">1. Check your email inbox (and spam folder)</Text>
                            <Text className="text-sm text-blue-700 mb-1">2. Find the temporary password in the email</Text>
                            <Text className="text-sm text-blue-700 mb-1">3. Copy the temporary password</Text>
                            <Text className="text-sm text-blue-700">4. Use it as your "current password" below</Text>
                        </View>
                        
                        <Text className="text-xs text-center text-gray-400 leading-5">
                            The temporary password will be valid for 15 minutes. If you don't see the email, check your spam folder.
                        </Text>
                        
                        {/* Alternative for unregistered users */}
                        <View className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                            <Text className="text-sm font-semibold text-gray-700 mb-2">Don't have an account?</Text>
                            <TouchableOpacity 
                                onPress={() => router.push('/(auth)/customer-signup')}
                                className="bg-gray-600 rounded-lg py-2 px-4"
                            >
                                <Text className="text-white text-center text-sm font-medium">Create New Account</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View className="mb-8">
                        <Button
                            title="Go to Change Password"
                            variant="primary"
                            onPress={handleGoToChangePassword}
                        />
                        <View className="mt-4">
                            <Button
                                title="Back to Login"
                                variant="outline"
                                onPress={handleBackToLogin}
                            />
                        </View>
                    </View>
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

            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView
                    contentContainerStyle={{
                        flexGrow: 1,
                        justifyContent: 'center',
                        padding: 24,
                    }}
                    keyboardShouldPersistTaps="handled">

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
                    <Text className="text-base text-center text-gray-500 leading-6">
                        Enter your email address and we'll send you a temporary password to reset your account
                    </Text>
                </View>

                    {/* Email Input */}
                    <View className="mb-6">
                        <TextInput
                            placeholder="Enter your email address"
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                if (error) setError(''); // Clear error when user types
                            }}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            variant={error && !email ? 'error' : 'default'}
                            editable={!isLoading}
                        />
                        {email && (
                            <Text className={`text-xs mt-1 ${isEmailValid ? 'text-green-600' : 'text-gray-500'}`}>
                                {isEmailValid ? '✓ Valid email format' : 'Please enter a valid email'}
                            </Text>
                            )}
                        </View>

                    {/* Error Messages */}
                    {error ? (
                        <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <Text className="text-red-600 text-center">{error}</Text>
                        </View>
                    ) : null}

                    {/* Send Temporary Password Button */}
                    <View className="mb-6">
                    <Button
                            title="Send Temporary Password"
                        variant="primary"
                            onPress={handleSubmit}
                            disabled={isLoading || !email || !isEmailValid}
                            loading={isLoading}
                    />
                </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
} 