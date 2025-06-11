import { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button } from '../../components/Button';
import { TextInput } from '../../components/TextInput';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import AuthService from '../../services/authService';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Extract params
  const token = params.token as string;
  const contact = params.contact as string;

  // State management
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Validation helpers
  const isPasswordValid = newPassword.length >= 6;
  const doPasswordsMatch = newPassword === confirmPassword;
  const isFormValid = isPasswordValid && doPasswordsMatch && newPassword && confirmPassword;

  // Handle reset password
  const handleResetPassword = async () => {
    setError('');
    setIsLoading(true);

    try {
      // Validation
      if (!newPassword || !confirmPassword) {
        setError('Please fill in all fields.');
        return;
      }

      if (!isPasswordValid) {
        setError('Password must be at least 6 characters long.');
        return;
      }

      if (!doPasswordsMatch) {
        setError('Passwords do not match.');
        return;
      }

      console.log('🔑 Resetting password with token:', token);

      // Call API service
      const response = await AuthService.resetPassword(token, newPassword);

      if (response.success) {
        console.log('✅ Password reset successfully');
        
        // Navigate to success screen or login
        router.replace('/(auth)/reset-password-success');
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

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 'none', color: 'gray-300', text: '' };
    if (password.length < 6) return { strength: 'weak', color: 'red-500', text: 'Weak' };
    if (password.length < 8) return { strength: 'medium', color: 'yellow-500', text: 'Medium' };
    if (password.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return { strength: 'strong', color: 'green-500', text: 'Strong' };
    }
    return { strength: 'medium', color: 'yellow-500', text: 'Medium' };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

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
            <View className="w-20 h-20 rounded-full bg-green-50 items-center justify-center mb-6">
              <Ionicons name="lock-closed" size={40} color={colors.primary} />
            </View>
            <Text className="text-2xl font-bold text-center mb-2 text-gray-800">
              Create New Password
            </Text>
            <Text className="text-base text-gray-500 text-center leading-6">
              Your new password must be different from your previous password.
            </Text>
          </View>

          {/* New Password Input */}
          <View className="mb-4">
            <TextInput
              placeholder="Enter new password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              variant={error && !newPassword ? 'error' : 'default'}
              editable={!isLoading}
            />
            {newPassword && (
              <View className="mt-2">
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs text-gray-500">Password strength:</Text>
                  <Text className={`text-xs font-medium text-${passwordStrength.color}`}>
                    {passwordStrength.text}
                  </Text>
                </View>
                <View className="w-full h-2 bg-gray-200 rounded-full mt-1">
                  <View 
                    className={`h-full bg-${passwordStrength.color} rounded-full`}
                    style={{ 
                      width: passwordStrength.strength === 'weak' ? '33%' : 
                             passwordStrength.strength === 'medium' ? '66%' : '100%' 
                    }}
                  />
                </View>
              </View>
            )}
          </View>

          {/* Confirm Password Input */}
          <View className="mb-6">
            <TextInput
              placeholder="Confirm new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              variant={error && !confirmPassword ? 'error' : 'default'}
              editable={!isLoading}
            />
            {confirmPassword && (
              <Text className={`text-xs mt-1 ${doPasswordsMatch ? 'text-green-600' : 'text-red-500'}`}>
                {doPasswordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
              </Text>
            )}
          </View>

          {/* Password Requirements */}
          <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <Text className="text-blue-800 font-medium mb-2">Password Requirements:</Text>
            <View className="space-y-1">
              <Text className={`text-sm ${newPassword.length >= 6 ? 'text-green-600' : 'text-gray-500'}`}>
                {newPassword.length >= 6 ? '✓' : '•'} At least 6 characters
              </Text>
              <Text className={`text-sm ${/(?=.*[a-z])(?=.*[A-Z])/.test(newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                {/(?=.*[a-z])(?=.*[A-Z])/.test(newPassword) ? '✓' : '•'} Upper and lowercase letters (recommended)
              </Text>
              <Text className={`text-sm ${/(?=.*\d)/.test(newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                {/(?=.*\d)/.test(newPassword) ? '✓' : '•'} At least one number (recommended)
              </Text>
            </View>
          </View>

          {/* Error Messages */}
          {error ? (
            <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <Text className="text-red-600 text-center">{error}</Text>
            </View>
          ) : null}

          {/* Reset Password Button */}
          <View className="mb-6">
            <Button
              title={isLoading ? "Updating Password..." : "Update Password"}
              variant="primary"
              onPress={handleResetPassword}
              disabled={isLoading || !isFormValid}
            />
            {isLoading && (
              <View className="flex-row justify-center mt-2">
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            )}
          </View>

          {/* Contact Info (for reference) */}
          <View className="items-center">
            <Text className="text-xs text-gray-400">
              Resetting password for: {contact}
            </Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 