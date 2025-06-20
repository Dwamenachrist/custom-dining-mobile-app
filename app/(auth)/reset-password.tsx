import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../components/Button';
import { TextInput } from '../../components/TextInput';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import AuthService from '../../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ResetPasswordScreen() {
    const router = useRouter();
    
    const [tempPassword, setTempPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [userEmail, setUserEmail] = useState('');

    // Validation helpers
    const isNewPasswordValid = newPassword.length >= 8 && /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
    const doPasswordsMatch = newPassword === confirmPassword && newPassword.length > 0;

    useEffect(() => {
        // Get user email from forgot password flow
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
    }, []);

    const handleResetPassword = async () => {
        setError('');
        setIsLoading(true);
        
        try {
            // Validation
            if (!tempPassword) {
                setError('Please enter the temporary password from your email.');
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

            console.log('🔑 Resetting password using temporary password');

            // Use change password API with temp password as current password
            const response = await AuthService.changePassword(tempPassword, newPassword);

            if (response.success) {
                console.log('✅ Password reset successfully');
                setIsSuccess(true);
                // Clear forgot password data
                await AsyncStorage.multiRemove(['forgot_password_email']);
            } else {
                setError(response.message || 'Failed to reset password. Please check your temporary password and try again.');
            }
        } catch (error) {
            console.error('❌ Reset password error:', error);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToLogin = () => {
        router.replace('/(auth)/customer-login');
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

                <View className="flex-1 px-6 justify-center">
                    <View className="items-center mb-8">
                        <View className="w-24 h-24 bg-green-50 rounded-full items-center justify-center mb-6">
                            <Ionicons name="checkmark-circle" size={48} color="#10B981" />
                        </View>
                    </View>

                    <View className="mb-8">
                        <Text className="text-2xl font-bold text-center text-gray-800 mb-4">
                            Password Reset Successfully
                        </Text>
                        <Text className="text-base text-center text-gray-500 leading-6">
                            Your password has been updated successfully. You can now log in with your new password.
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

                    {/* Illustration */}
                    <View className="items-center mt-8">
                        <View className="items-center justify-center mb-4">
                            <Image
                                source={require('../../assets/password-reset.png')}
                                className="w-286 h-286"
                                resizeMode="contain"
                            />
                        </View>
                    </View>

                    {/* Title and Subtitle */}
                    <View className="mb-12">
                        <Text className="text-2xl font-bold text-center text-gray-800 mb-2">
                            Reset Your Password
                        </Text>
                        <Text className="text-base text-center text-gray-500 leading-6">
                            Use the temporary password from your email to set a new password
                        </Text>
                        
                        {userEmail && (
                            <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                                <Text className="text-sm font-semibold text-blue-800 mb-2">📧 Check your email:</Text>
                                <Text className="text-sm text-blue-700 mb-1">We sent a temporary password to:</Text>
                                <Text className="text-sm text-blue-800 font-semibold">{userEmail}</Text>
                            </View>
                        )}
                        
                        {/* Instructions */}
                        <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                            <Text className="text-sm font-semibold text-yellow-800 mb-2">💡 How to proceed:</Text>
                            <Text className="text-sm text-yellow-700 mb-1">• Check your email for the temporary password</Text>
                            <Text className="text-sm text-yellow-700 mb-1">• Enter it in the "Temporary Password" field below</Text>
                            <Text className="text-sm text-yellow-700">• Create your new password</Text>
                        </View>
                    </View>

                    {/* Temporary Password Input */}
                    <View className="mb-6">
                        <TextInput
                            placeholder="Temporary Password (from your email)"
                            value={tempPassword}
                            onChangeText={(text) => {
                                setTempPassword(text);
                                if (error) setError(''); // Clear error when user types
                            }}
                            secureTextEntry
                            variant={error && !tempPassword ? 'error' : 'default'}
                            editable={!isLoading}
                        />
                        <Text className="text-xs mt-1 text-gray-500">
                            Copy and paste the temporary password from your email
                        </Text>
                    </View>

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

                    {/* Reset Password Button */}
                    <View className="mb-6">
                        <Button
                            title="Reset Password"
                            variant="primary"
                            onPress={handleResetPassword}
                            disabled={isLoading || !tempPassword || !newPassword || !confirmPassword || !isNewPasswordValid || !doPasswordsMatch}
                            loading={isLoading}
                        />
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
} 