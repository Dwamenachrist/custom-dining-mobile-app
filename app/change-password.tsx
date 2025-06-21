import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, useSearchParams } from 'expo-router';
import { Button } from '../components/Button';
import { TextInput } from '../components/TextInput';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import AuthService from '../services/authService';
import { useAuth } from '../auth-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ChangePasswordScreen() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setIsLoggedIn, setUser, setJwt } = useAuth();
    
    // Get reset token from URL (for forgot password flow)
    const resetToken = searchParams.get('token');
    
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isSessionExpired, setIsSessionExpired] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    
    // Determine if this is forgot password flow or authenticated user flow
    const isForgotPasswordFlow = !!resetToken;

    // Validation helpers
    const trimmedNewPassword = newPassword.trim();
    const trimmedConfirmPassword = confirmPassword.trim();
    const isNewPasswordValid = trimmedNewPassword.length >= 8 && /[!@#$%^&*(),.?":{}|<>]/.test(trimmedNewPassword);
    const doPasswordsMatch = trimmedNewPassword.length > 0 && trimmedConfirmPassword.length > 0 && trimmedNewPassword === trimmedConfirmPassword;

    useEffect(() => {
        console.log('🔑 Change Password Screen - Mode:', isForgotPasswordFlow ? 'Forgot Password Flow' : 'Authenticated User Flow');
        
        if (isForgotPasswordFlow) {
            console.log('✅ Reset token found:', resetToken?.substring(0, 10) + '...');
            
            // Get user email from forgot password flow (for display)
            const getUserEmail = async () => {
                try {
                    const email = await AsyncStorage.getItem('forgot_password_email');
                    if (email) {
                        setUserEmail(email);
                        console.log('📧 User email from forgot password:', email);
                    }
                } catch (error) {
                    console.error('❌ Failed to get user email:', error);
                }
            };
            
            getUserEmail();
        }
    }, [resetToken, isForgotPasswordFlow]);

    const handleChangePassword = async () => {
        setError('');
        setIsLoading(true);
        
        try {
            // Trim passwords to remove any whitespace
            const trimmedCurrentPassword = currentPassword.trim();
            const trimmedNewPassword = newPassword.trim();
            const trimmedConfirmPassword = confirmPassword.trim();

            // Common validation for both flows
            if (!trimmedNewPassword) {
                setError('Please enter a new password.');
                return;
            }

            if (!isNewPasswordValid) {
                setError('New password must be at least 8 characters and contain at least one special character.');
                return;
            }

            if (!trimmedConfirmPassword) {
                setError('Please confirm your new password.');
                return;
            }

            if (trimmedNewPassword !== trimmedConfirmPassword) {
                setError('New passwords do not match.');
                return;
            }

            let response;

            if (isForgotPasswordFlow) {
                // FORGOT PASSWORD FLOW: Use reset token (no current password needed)
                if (!resetToken) {
                    setError('No reset token found. Please use the link from your email.');
                    return;
                }

                console.log('🔑 Resetting password using token from forgot password flow');
                response = await AuthService.resetPassword(resetToken, trimmedNewPassword);

                if (response.success) {
                    console.log('✅ Password reset successfully via token');
                    setIsSuccess(true);
                    // Clear forgot password data
                    await AsyncStorage.multiRemove(['forgot_password_email']);
                } else {
                    if (response.message?.toLowerCase().includes('invalid') || 
                        response.message?.toLowerCase().includes('expired')) {
                        setError('Reset link has expired or is invalid. Please request a new password reset.');
                    } else {
                        setError(response.message || 'Failed to reset password. Please try again.');
                    }
                }
            } else {
                // AUTHENTICATED USER FLOW: Use current password + Bearer token
                if (!trimmedCurrentPassword) {
                    setError('Please enter your current password.');
                    return;
                }

                if (trimmedCurrentPassword === trimmedNewPassword) {
                    setError('New password must be different from current password.');
                    return;
                }

                console.log('🔑 Changing password for authenticated user');

                // Check if user is still authenticated before making the request
                const isAuthenticated = await AuthService.isAuthenticated();
                if (!isAuthenticated) {
                    setError('Your session has expired. Please log in again.');
                    setIsSessionExpired(true);
                    return;
                }

                response = await AuthService.changePassword(trimmedCurrentPassword, trimmedNewPassword, trimmedConfirmPassword);

                if (response.success) {
                    console.log('✅ Password changed successfully for authenticated user');
                    setIsSuccess(true);
                } else {
                    // Check for specific session expiration error
                    if (response.message?.toLowerCase().includes('session') || 
                        response.message?.toLowerCase().includes('expired') ||
                        response.message?.toLowerCase().includes('unauthorized') ||
                        response.error?.toLowerCase().includes('401')) {
                        setError('Your session has expired. Please log in again to change your password.');
                        setIsSessionExpired(true);
                    } else {
                        setError(response.message || 'Failed to change password. Please check your current password and try again.');
                    }
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

    const handleDone = async () => {
        // After successfully changing password, check user state and redirect appropriately
        try {
            // Clear force password change flag since password was successfully changed
            await AsyncStorage.setItem('forcePasswordChange', 'false');
            console.log('🔓 Force password change cleared');
            
            // Check user state to determine where to redirect
            const userType = await AsyncStorage.getItem('userType');
            const hasUserProfile = await AsyncStorage.getItem('hasUserProfile') === 'true';
            
            if (userType === 'customer') {
                if (!hasUserProfile) {
                    console.log('🍽️ Customer needs meal plan after password change');
                    router.replace('/meal-plan-builder');
                } else {
                    console.log('🏠 Customer ready after password change');
                    router.replace('/(customer-tabs)/home');
                }
            } else if (userType === 'restaurant') {
                console.log('🏪 Restaurant ready after password change');
                router.replace('/(restaurant-tabs)/home');
            } else {
                // Fallback
                router.back();
            }
        } catch (error) {
            console.error('❌ Error in handleDone:', error);
            router.back();
        }
    };

    const handleLoginRedirect = async () => {
        try {
            // Clear authentication state
            setIsLoggedIn(false);
            setUser(null);
            setJwt(null);
            
            // Clear stored auth data
            await AuthService.logout();
            
            // Navigate to login
            router.replace('/(auth)/customer-login');
        } catch (error) {
            console.error('Error during logout:', error);
            // Still redirect even if logout fails
            router.replace('/(auth)/customer-login');
        }
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
                            {isForgotPasswordFlow ? 'Password Reset Successfully' : 'Password Changed Successfully'}
                        </Text>
                        <Text className="text-base text-center text-gray-500 leading-6">
                            {isForgotPasswordFlow 
                                ? 'Your password has been reset successfully. You can now log in with your new password.'
                                : 'Your password has been updated successfully. You can continue using the app with your new password.'
                            }
                        </Text>
                    </View>

                    <Button
                        title={isForgotPasswordFlow ? "Back to Login" : "Done"}
                        variant="primary"
                        onPress={isForgotPasswordFlow ? () => router.replace('/(auth)/customer-login') : handleDone}
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
                <Text className="text-lg font-semibold text-gray-800">Change Password</Text>
            </View>

            {/* Illustration */}
            <View className="items-center mb-6">
                <Image
                    source={require('../assets/password-reset.png')}
                    style={{ width: 126, height: 126 }}
                    resizeMode="contain"
                />
            </View>

            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
                <ScrollView
                    contentContainerStyle={{
                        flexGrow: 1,
                        justifyContent: 'flex-start',
                        paddingTop: 20,
                        paddingHorizontal: 24,
                        paddingBottom: 40,
                    }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}>

                    {/* Title and Subtitle */}
                    <View className="mb-8">
                        <Text className="text-2xl font-bold text-center text-gray-800 mb-2">
                            {isForgotPasswordFlow ? 'Reset Your Password' : 'Change Your Password'}
                        </Text>
                        <Text className="text-base text-center text-gray-500 leading-6">
                            {isForgotPasswordFlow 
                                ? 'Create a new password for your account' 
                                : 'Enter your current password and choose a new one'
                            }
                        </Text>

                        {/* Status Messages */}
                        {isForgotPasswordFlow ? (
                            <>
                                {userEmail && (
                                    <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                                        <Text className="text-sm font-semibold text-blue-800 mb-2">📧 Resetting password for:</Text>
                                        <Text className="text-sm text-blue-800 font-semibold">{userEmail}</Text>
                                    </View>
                                )}
                                
                                <View className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                                    <Text className="text-sm font-semibold text-green-800 mb-2">✅ Valid reset link</Text>
                                    <Text className="text-sm text-green-700">Enter your new password below to complete the reset.</Text>
                                </View>
                            </>
                        ) : null}
                    </View>

                    {/* Current Password Input - Only show for authenticated users */}
                    {!isForgotPasswordFlow && (
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
                            <Text className="text-xs mt-1 text-gray-500">
                                Enter your current password to verify your identity
                            </Text>
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
                            <Text className="text-red-600 text-center mb-2">{error}</Text>
                            {isSessionExpired && (
                                <Button
                                    title="Go to Login"
                                    variant="primary"
                                    onPress={handleLoginRedirect}
                                />
                            )}
                        </View>
                    ) : null}

                    {/* Change Password Button */}
                    <View className="mb-6">
                        <Button
                            title={isForgotPasswordFlow ? "Reset Password" : "Change Password"}
                            variant="primary"
                            onPress={handleChangePassword}
                            disabled={
                                isLoading || 
                                !newPassword || 
                                !confirmPassword || 
                                !isNewPasswordValid || 
                                !doPasswordsMatch ||
                                (!isForgotPasswordFlow && !currentPassword) // Only require current password for authenticated users
                            }
                            loading={isLoading}
                        />
                    </View>

                    {/* Additional Actions for Forgot Password Flow */}
                    {isForgotPasswordFlow && (
                        <View className="mb-6">
                            <Button
                                title="Back to Login"
                                variant="secondary"
                                onPress={() => router.replace('/(auth)/customer-login')}
                            />
                        </View>
                    )}

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
