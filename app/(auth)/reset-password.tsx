import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button } from '../../components/Button';
import { TextInput } from '../../components/TextInput';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import AuthService from '../../services/authService';

export default function ResetPasswordScreen() {
  const router = useRouter();
    const { token } = useLocalSearchParams<{ token: string }>();
    
    const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isTokenValid, setIsTokenValid] = useState(true);

  // Validation helpers
    const isPasswordValid = password.length >= 8 && /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const doPasswordsMatch = password === confirmPassword && password.length > 0;

    useEffect(() => {
        if (!token) {
            setError('Reset token is missing. Please use the link from your email.');
            setIsTokenValid(false);
        }
    }, [token]);

  const handleResetPassword = async () => {
    setError('');
    setIsLoading(true);
        
        try {
            // Validation
            if (!token) {
                setError('Reset token is missing. Please use the link from your email.');
                return;
            }

            if (!password) {
                setError('Please enter a new password.');
                return;
            }

            if (!isPasswordValid) {
                setError('Password must be at least 8 characters and contain at least one special character.');
                return;
            }

            if (!doPasswordsMatch) {
                setError('Passwords do not match.');
                return;
            }

            console.log('🔑 Resetting password with token:', token);

            // Call reset password API
            const response = await AuthService.resetPassword(token, password);

            if (response.success) {
                console.log('✅ Password reset successfully');
                setIsSuccess(true);
            } else {
                setError(response.message || 'Failed to reset password. Please try again.');
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
                            Invalid Reset Link
                        </Text>
                        <Text className="text-base text-center text-gray-500 leading-6">
                            The password reset link is invalid or has expired. Please request a new password reset link.
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
                            Enter your new password below
            </Text>
          </View>

                    {/* Password Input */}
                    <View className="mb-6">
            <TextInput
                            placeholder="New Password"
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                if (error) setError(''); // Clear error when user types
                            }}
              secureTextEntry
                            variant={error && !password ? 'error' : 'default'}
              editable={!isLoading}
            />
                        {password && (
                            <Text className={`text-xs mt-1 ${isPasswordValid ? 'text-green-600' : 'text-gray-500'}`}>
                                {isPasswordValid ? '✓ Password meets requirements' : 'Must be at least 8 characters with special character'}
                  </Text>
            )}
          </View>

          {/* Confirm Password Input */}
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
                            disabled={isLoading || !password || !confirmPassword || !isPasswordValid || !doPasswordsMatch}
                            loading={isLoading}
            />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 