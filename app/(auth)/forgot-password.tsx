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
    const [showTempPasswordToast, setShowTempPasswordToast] = useState(false);

    // Validation helper
    const isEmailValid = email.includes('@') && email.includes('.');

    // New function to verify email exists without sending reset link
    const verifyEmailExists = async (email: string) => {
        console.log('📧 Starting email verification for:', email);
        
        // Use the existing signup endpoint to check if email already exists
        const response = await AuthService.signup({
            firstName: 'temp',
            lastName: 'temp', 
            email: email,
            phoneNumber: '1234567890',
            password: 'tempPassword123!',
            confirmPassword: 'tempPassword123!'
        });
        
        console.log('📧 Signup response:', response);
        
        // AuthService returns a response object, not throwing errors
        if (response.success === false) {
            // Check if the error message indicates email already exists
            const message = response.message?.toLowerCase() || '';
            
            console.log('📧 Checking message for email exists:', message);
            
            if (message.includes('email already exists') || 
                message.includes('email is already registered') ||
                message.includes('already registered')) {
                console.log('✅ Email exists - verification successful!');
                return { exists: true, message: 'Email verified successfully' };
            } else {
                console.log('❌ Different error - email might not exist:', response.message);
                return { exists: false, message: response.message || 'Email verification failed' };
            }
        } else {
            // If signup succeeds, email doesn't exist
            console.log('❌ Signup succeeded - email doesn\'t exist');
            return { exists: false, message: 'Email not found in our system' };
        }
    };

    // Function to send temporary password email
    const sendTempPasswordEmail = async (email: string) => {
        console.log('📧 Sending temporary password email to:', email);
        
        try {
            const response = await AuthService.forgotPassword(email);
            
            if (response.success) {
                console.log('✅ Temporary password email sent successfully');
                return { success: true, message: 'Temporary password sent to your email' };
            } else {
                console.log('❌ Failed to send temporary password email:', response.message);
                return { success: false, message: response.message || 'Failed to send temporary password' };
            }
        } catch (error) {
            console.error('❌ Error sending temporary password email:', error);
            return { success: false, message: 'Failed to send temporary password email' };
        }
    };

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

            console.log('📧 Starting two-step verification process for:', email);

            // Step 1: Verify email exists
            const verificationResult = await verifyEmailExists(email);

            if (!verificationResult.exists) {
                setError('Email not found. Please check your email address or sign up for a new account.');
                return;
            }

            console.log('✅ Step 1 complete: Email verified');

            // Step 2: Send temporary password email
            const tempPasswordResult = await sendTempPasswordEmail(email);

            if (!tempPasswordResult.success) {
                setError(tempPasswordResult.message || 'Failed to send temporary password');
                return;
            }

            console.log('✅ Step 2 complete: Temporary password email sent');

            // Store email for change password screen
            await AsyncStorage.setItem('forgot_password_email', email);

            // Store that we should show the toast on the next screen
            await AsyncStorage.setItem('show_temp_password_toast', 'true');
            await AsyncStorage.setItem('temp_password_email', email);

            // Show toast with instructions
            setShowTempPasswordToast(true);

            // Navigate to change password screen after a short delay
            setTimeout(() => {
                router.push('/change-password?fromForgotPassword=true');
            }, 2000); // Shorter delay since toast will persist

        } catch (err: any) {
            const error = err;
            console.error('❌ Two-step verification error:', error);
            
            // Check if it's a structured error response
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

    const handleBackToLogin = async () => {
        // Determine user type and route to appropriate login screen
        try {
            const userType = await AsyncStorage.getItem('userType');
            if (userType === 'restaurant') {
                router.replace('/(auth)/restaurant-login');
            } else {
                router.replace('/(auth)/customer-login');
            }
        } catch (error) {
            console.error('Error getting user type:', error);
            // Default to customer login
            router.replace('/(auth)/customer-login');
        }
    };

    // Temporary Password Toast Component
    const TempPasswordToast = () => {
        if (!showTempPasswordToast) return null;

        return (
            <View style={{
                position: 'absolute',
                top: 100,
                left: 16,
                right: 16,
                zIndex: 9999,
                elevation: 9999,
            }}>
                <View style={{
                    backgroundColor: 'white',
                    borderRadius: 12,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8,
                    borderWidth: 1,
                    borderColor: '#e5e7eb'
                }}>
                    <View className="flex-row items-start p-4">
                        {/* Email Icon */}
                        <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3 mt-1">
                            <Ionicons name="mail" size={20} color="#16a34a" />
                        </View>

                        {/* Message */}
                        <View className="flex-1">
                            <Text className="text-sm font-semibold text-gray-900 mb-1">
                                Temporary Password Sent! 🔑
                            </Text>
                            <Text className="text-xs text-gray-600 leading-4 mb-2">
                                We've sent a temporary password to{' '}
                                <Text className="font-medium text-gray-800">{email}</Text>
                            </Text>
                            <Text className="text-xs text-green-600 font-medium leading-4 mb-1">
                                📧 Check your email and copy the temporary password
                            </Text>
                            <Text className="text-xs text-gray-500 leading-4">
                                You'll need it to set your new password on the next screen.
                            </Text>
                        </View>

                        {/* Close Button */}
                        <TouchableOpacity 
                            onPress={() => setShowTempPasswordToast(false)} 
                            className="p-1"
                        >
                            <Ionicons name="close" size={18} color="#6b7280" />
                        </TouchableOpacity>
                    </View>

                    {/* Action Button */}
                    <View className="border-t border-gray-100">
                        <TouchableOpacity 
                            onPress={() => {
                                setShowTempPasswordToast(false);
                                router.push('/change-password?fromForgotPassword=true');
                            }}
                            className="py-3 items-center"
                        >
                            <Text className="text-sm font-medium" style={{ color: '#16a34a' }}>
                                Continue to Change Password
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-lightGray">
            <StatusBar barStyle="dark-content" />

            {/* Temporary Password Toast */}
            <TempPasswordToast />

            {/* Header with reduced padding */}
            <View className="flex-row items-center p-4 pt-8">
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
                        paddingHorizontal: 24,
                        paddingBottom: 40, // Add bottom padding for button visibility
                    }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled">

                {/* Illustration with reduced top margin */}
                <View className="items-center mt-4">
                    <View className="items-center justify-center mb-4">
                        <Image
                            source={require('../../assets/forgot-password.png')}
                            className="w-64 h-64"
                            resizeMode="contain"
                        />
                    </View>
                </View>

                {/* Title and Subtitle with reduced margin */}
                <View className="mb-8">
                    <Text className="text-2xl font-bold text-center text-gray-800 mb-2">
                        Forgot Your Password?
                    </Text>
                    <Text className="text-base text-center text-gray-500 leading-6">
                        Enter your email address to verify your account and receive a temporary password
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

                    {/* Get Temporary Password Button */}
                    <View className="mb-6">
                        <Button
                            title="Get Temporary Password"
                            variant="primary"
                            onPress={handleSubmit}
                            disabled={isLoading || !email || !isEmailValid}
                            loading={isLoading}
                        />
                    </View>

                    {/* Don't have account section */}
                    <View className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                        <Text className="text-sm font-semibold text-gray-700 mb-2 text-center">Don't have an account?</Text>
                        <TouchableOpacity 
                            onPress={() => router.push('/(auth)/customer-signup')}
                            className="bg-green-600 rounded-lg py-3 px-4"
                        >
                            <Text className="text-white text-center text-sm font-medium">Create New Account</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
} 