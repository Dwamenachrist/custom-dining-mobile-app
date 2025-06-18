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
                setIsSuccess(true);
                // Save email for potential use in change password screen
                await AsyncStorage.setItem('forgot_password_email', email);
            } else {
                setError(response.message || 'Failed to send reset email. Please try again.');
            }
        } catch (error) {
            console.error('❌ Forgot password error:', error);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToLogin = () => {
        router.replace('/(auth)/customer-login');
    };

    const handleGoToChangePassword = () => {
        // Navigate directly to change password screen with forgot password flag
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
                        <Text className="text-base text-center text-gray-500 leading-6">
                            We've sent a password reset link to{' '}
                            <Text className="font-semibold text-gray-800">{email}</Text>
                        </Text>
                        <Text className="text-sm text-center text-gray-500 mt-4 leading-6">
                            Click the link in the email to open the app and reset your password. If you don't see the email, check your spam folder.
                        </Text>
                    </View>

                    {/* Action Buttons */}
                    <View className="mb-8">
                        <Button
                            title="Back to Login"
                            variant="primary"
                            onPress={handleBackToLogin}
                        />
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
                            Enter your email address and we'll send you a link to reset your password
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

                    {/* Send Reset Link Button */}
                    <View className="mb-6">
                    <Button
                            title="Send Reset Link"
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