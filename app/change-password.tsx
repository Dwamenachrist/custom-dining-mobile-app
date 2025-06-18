import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button } from '../components/Button';
import { TextInput } from '../components/TextInput';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import AuthService from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ChangePasswordScreen() {
    const router = useRouter();
    const { fromForgotPassword } = useLocalSearchParams<{ fromForgotPassword?: string }>();
    
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isFromForgotPassword, setIsFromForgotPassword] = useState(false);

    // Check if user comes from forgot password flow
    useEffect(() => {
        const checkForgotPasswordFlow = async () => {
            const forgotPasswordEmail = await AsyncStorage.getItem('forgot_password_email');
            const isFromForgot = fromForgotPassword === 'true' || !!forgotPasswordEmail;
            setIsFromForgotPassword(isFromForgot);
        };
        
        checkForgotPasswordFlow();
    }, [fromForgotPassword]);

    // Validation helpers
    const isNewPasswordValid = newPassword.length >= 8 && /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
    const doPasswordsMatch = newPassword === confirmPassword && newPassword.length > 0;

    const handleChangePassword = async () => {
        setError('');
        setIsLoading(true);
        
        try {
            // Validation
            if (!isFromForgotPassword && !currentPassword) {
                setError('Please enter your current password.');
                return;
            }

            if (!newPassword) {
                setError('Please enter a new password.');
                return;
            }

            if (!isNewPasswordValid) {
                setError('New password must be at least 8 characters and contain at least one special character.');
                return;
            }

            if (!doPasswordsMatch) {
                setError('New passwords do not match.');
                return;
            }

            if (!isFromForgotPassword && currentPassword === newPassword) {
                setError('New password must be different from current password.');
                return;
            }

            console.log('🔑 Changing password for logged-in user');

            // For forgot password flow, we need to use reset password API
            if (isFromForgotPassword) {
                // Get the token from AsyncStorage or URL params
                const forgotPasswordToken = await AsyncStorage.getItem('forgot_password_token');
                
                if (!forgotPasswordToken) {
                    setError('Reset token not found. Please use the email link to reset your password.');
                    setIsLoading(false);
                    return;
                }

                // Use reset password API for forgot password flow
                const response = await AuthService.resetPassword(forgotPasswordToken, newPassword);

                if (response.success) {
                    console.log('✅ Password reset successfully');
                    setIsSuccess(true);
                    // Clear forgot password data
                    await AsyncStorage.multiRemove(['forgot_password_email', 'forgot_password_token']);
                } else {
                    setError(response.message || 'Failed to reset password. Please try again.');
                }
            } else {
                // Call change password API (only for logged-in users)
                const response = await AuthService.changePassword(currentPassword, newPassword);

                if (response.success) {
                    console.log('✅ Password changed successfully');
                    setIsSuccess(true);
                    // Clear forgot password email if it exists
                    await AsyncStorage.removeItem('forgot_password_email');
                } else {
                    setError(response.message || 'Failed to change password. Please try again.');
                }
            }
        } catch (error) {
            console.error('❌ Change password error:', error);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        router.back();
    };

    const handleDone = () => {
        router.back();
    };

    if (isSuccess) {
        return (
            <SafeAreaView className="flex-1 bg-lightGray">
                <StatusBar barStyle="dark-content" />

                {/* Header */}
                <View className="flex-row items-center p-6 pt-12">
                    <TouchableOpacity onPress={handleBack} className="mr-4">
                        <Ionicons name="arrow-back" size={24} color={colors.darkGray} />
                    </TouchableOpacity>
                    <Text className="text-lg font-semibold text-gray-800">Change Password</Text>
                </View>

                <View className="flex-1 px-6 justify-center">
                    <View className="items-center mb-8">
                        <View className="w-24 h-24 bg-green-50 rounded-full items-center justify-center mb-6">
                            <Ionicons name="checkmark-circle" size={48} color="#10B981" />
                        </View>
                    </View>

                    <View className="mb-8">
                        <Text className="text-2xl font-bold text-center text-gray-800 mb-4">
                            Password Changed Successfully
                        </Text>
                        <Text className="text-base text-center text-gray-500 leading-6">
                            Your password has been updated successfully. You can now use your new password to log in.
                        </Text>
                    </View>

                    <Button
                        title="Done"
                        variant="primary"
                        onPress={handleDone}
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
                <TouchableOpacity onPress={handleBack} className="mr-4">
                    <Ionicons name="arrow-back" size={24} color={colors.darkGray} />
                </TouchableOpacity>
                <Text className="text-lg font-semibold text-gray-800">
                    {isFromForgotPassword ? 'Reset Password' : 'Change Password'}
                </Text>
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
                                source={require('../assets/password-reset.png')}
                                className="w-286 h-286"
                                resizeMode="contain"
                            />
                        </View>
                    </View>

                    {/* Title and Subtitle */}
                    <View className="mb-12">
                        <Text className="text-2xl font-bold text-center text-gray-800 mb-2">
                            {isFromForgotPassword ? 'Reset Your Password' : 'Change Your Password'}
                        </Text>
                        <Text className="text-base text-center text-gray-500 leading-6">
                            {isFromForgotPassword 
                                ? 'Enter your new password below' 
                                : 'Enter your current password and choose a new one'
                            }
                        </Text>
                    </View>

                    {/* Current Password Input - Only show if not from forgot password */}
                    {!isFromForgotPassword && (
                        <View className="mb-6">
                            <TextInput
                                placeholder="Current Password"
                                value={currentPassword}
                                onChangeText={(text) => {
                                    setCurrentPassword(text);
                                    if (error) setError(''); // Clear error when user types
                                }}
                                secureTextEntry
                                variant={error && !currentPassword ? 'error' : 'default'}
                                editable={!isLoading}
                            />
                        </View>
                    )}

                    {/* New Password Input */}
                    <View className="mb-6">
                        <TextInput
                            placeholder="New Password"
                            value={newPassword}
                            onChangeText={(text) => {
                                setNewPassword(text);
                                if (error) setError(''); // Clear error when user types
                            }}
                            secureTextEntry
                            variant={error && !newPassword ? 'error' : 'default'}
                            editable={!isLoading}
                        />
                        {newPassword && (
                            <Text className={`text-xs mt-1 ${isNewPasswordValid ? 'text-green-600' : 'text-gray-500'}`}>
                                {isNewPasswordValid ? '✓ Password meets requirements' : 'Must be at least 8 characters with special character'}
                            </Text>
                        )}
                    </View>

                    {/* Confirm New Password Input */}
                    <View className="mb-6">
                        <TextInput
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChangeText={(text) => {
                                setConfirmPassword(text);
                                if (error) setError(''); // Clear error when user types
                            }}
                            secureTextEntry
                            variant={error && !confirmPassword ? 'error' : 'default'}
                            editable={!isLoading}
                        />
                        {confirmPassword && (
                            <Text className={`text-xs mt-1 ${doPasswordsMatch ? 'text-green-600' : 'text-gray-500'}`}>
                                {doPasswordsMatch ? '✓ Passwords match' : 'Passwords do not match'}
                            </Text>
                        )}
                    </View>

                    {/* Error Messages */}
                    {error ? (
                        <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <Text className="text-red-600 text-center">{error}</Text>
                        </View>
                    ) : null}

                    {/* Change Password Button */}
                    <View className="mb-6">
                        <Button
                            title={isFromForgotPassword ? "Reset Password" : "Change Password"}
                            variant="primary"
                            onPress={handleChangePassword}
                            disabled={isLoading || (!isFromForgotPassword && !currentPassword) || !newPassword || !confirmPassword || !isNewPasswordValid || !doPasswordsMatch}
                            loading={isLoading}
                        />
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
} 