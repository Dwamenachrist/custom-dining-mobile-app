import { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../components/Button';
import { TextInput } from '../../components/TextInput';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import AuthService from '../../services/authService';

export default function ForgotPasswordEmailScreen() {
    const router = useRouter();

    // State management
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Validation helper
    const isEmailValid = email.includes('@') && email.includes('.');

    // Handle send OTP
    const handleSendOTP = async () => {
        setError('');
        setIsLoading(true);
        
        try {
            // Validation
            if (!email) {
                setError('Please enter your email address.');
                return;
            }

            if (!isEmailValid) {
                setError('Please enter a valid email address.');
                return;
            }

            console.log('📧 Sending forgot password request for email:', email);

            // Call forgot password API
            const response = await AuthService.forgotPassword(email);

            if (response.success) {
                console.log('✅ Forgot password email sent successfully');
                // Navigate to OTP verification screen with email
                router.push({
                    pathname: '/(auth)/forgot-password-verify',
                    params: {
                        method: 'email',
                        contact: email
                    }
                });
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

    const handleBack = () => {
        router.back();
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" />

            {/* Header with Back Button */}
            <View className="flex-row items-center p-6 pt-12">
                <TouchableOpacity onPress={handleBack} className="mr-4">
                    <Ionicons name="arrow-back" size={24} color={colors.darkGray} />
                </TouchableOpacity>
                <Text className="text-lg font-semibold text-darkGray">Email Address</Text>
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

                    {/* Icon and Title */}
                    <View className="items-center mb-8">
                        <View className="w-20 h-20 items-center justify-center mb-10">
                            <Image
                                source={require('../../assets/email-recovery.png')}
                                className="w-286 h-286"
                                resizeMode="contain"
                            />
                        </View>
                        <Text className="text-2xl font-bold text-center mt-12 mb-2 text-gray-800">
                            Enter Email Address
                        </Text>
                        <Text className="text-base text-gray-500 text-center leading-6">
                        Enter the email address used for registration
                        </Text>
                    </View>

                    {/* Email Input */}
                    <View className="mb-6">
                        <TextInput
                            placeholder="Enter your email address"
                            value={email}
                            onChangeText={setEmail}
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

                    {/* Send OTP Button */}
                    <View className="mb-6">
                        <Button
                            title={isLoading ? "Sending OTP..." : "Send OTP"}
                            variant="primary"
                            onPress={handleSendOTP}
                            disabled={isLoading || !email}
                        />
                        {isLoading && (
                            <View className="flex-row justify-center mt-2">
                                <ActivityIndicator size="small" color={colors.primary} />
                            </View>
                        )}
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
} 