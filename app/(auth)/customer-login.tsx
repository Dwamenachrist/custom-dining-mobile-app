import React, { useState, useEffect } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Image, TouchableOpacity, Switch, SafeAreaView, StatusBar, ActivityIndicator} from 'react-native';
import { useAuth } from '../../auth-context';
import { useRouter } from 'expo-router';
import { Button } from '../../components/Button';
import { TextInput } from '../../components/TextInput';
import { colors } from '../../theme/colors';
import AuthService from '../../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const { setIsLoggedIn } = useAuth();
  const router = useRouter();

  // State management for form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 📝 REMEMBER ME: Load saved email on component mount
  useEffect(() => {
    loadSavedEmail();
  }, []);

  // Load saved email if user previously chose "Remember Me"
  const loadSavedEmail = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem('remembered_email');
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
        console.log('💾 Loaded saved email:', savedEmail);
      }
    } catch (error) {
      console.error('❌ Failed to load saved email:', error);
    }
  };

  // Save or remove email based on Remember Me setting
  const handleRememberMeChange = async (value: boolean) => {
    setRememberMe(value);
    
    try {
      if (value && email) {
        // Save email if Remember Me is enabled and email exists
        await AsyncStorage.setItem('remembered_email', email);
        console.log('💾 Email saved for Remember Me');
      } else {
        // Remove saved email if Remember Me is disabled
        await AsyncStorage.removeItem('remembered_email');
        console.log('🗑️ Saved email removed');
      }
    } catch (error) {
      console.error('❌ Failed to handle Remember Me:', error);
    }
  };

  // Handlers for button presses
  const handleLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      if (!email || !password) {
        setError('Please enter both email and password.');
        return;
      }

      // Handle Remember Me before login attempt
      if (rememberMe) {
        await AsyncStorage.setItem('remembered_email', email);
        console.log('💾 Email saved for future logins');
      } else {
        await AsyncStorage.removeItem('remembered_email');
        console.log('🗑️ Email removed from saved data');
      }

      // Login without role - API determines user type
      const response = await AuthService.login({ email, password });

      if (response.success) {
        setIsLoggedIn(true);
        // The RootLayout will automatically redirect to the (tabs) stack.
      } else {
        // Display the actual backend error message
        console.log('Backend login error response:', response);
        setError(response.message || response.error || 'Login failed. Please check your credentials.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
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

  const handleForgotPassword = () => {
    // Navigate to the dedicated forgot password screen
    router.push('/(auth)/forgot-password');
  };


  return (
    <SafeAreaView className="flex-1 bg-lightGray">
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
          
          {/* Logo and Welcome Text */}
          <View className="mb-8">
            <Image
              source={require('../../assets/icon.png')}
              className="self-center align-center w-24 h-24 mb-6"
              resizeMode="contain"
            />
            <Text style={{ color: colors.primary }} className="text-3xl font-bold text-black">Welcome Back!</Text>
            <Text className="text-base text-darkGray mt-2">Login to continue using the app</Text>
          </View>

          {/* Form Inputs */}
          <TextInput
            placeholder="Email/Phone Number"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            variant={error && !email ? 'error' : 'default'}
            editable={!isLoading}
          />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry // This enables the password visibility toggle
            variant={error && !password ? 'error' : 'default'}
            editable={!isLoading}
          />

          {/* Remember Me & Forgot Password */}
          <View className="flex-row justify-between items-center my-2">
            <View className="flex-row items-center">
              <Switch
                trackColor={{ false: '#767577', true: colors.secondary }}
                thumbColor={rememberMe ? colors.primary : '#f4f3f4'}
                onValueChange={handleRememberMeChange}
                value={rememberMe}
                disabled={isLoading}
              />
              <Text className="text-darkGray ml-2">Remember me</Text>
            </View>
            <TouchableOpacity onPress={handleForgotPassword} disabled={isLoading}>
              <Text className="font-semibold text-primary">Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {error ? <Text className="text-error text-center my-4">{error}</Text> : null}

          {/* Sign In Button */}
          <View className="mt-4">
            <Button 
              title={isLoading ? "Signing In..." : "Sign In"} 
              variant="primary" 
              onPress={handleLogin}
              disabled={isLoading}
            />
            {isLoading && (
              <View className="flex-row justify-center mt-2">
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            )}
          </View>

          {/* Create Account & Language Selector */}
          <View className="mt-12">
            <View className="flex-row justify-center mb-6">
              <Text className="text-darkGray">New User? </Text>
              <TouchableOpacity 
                onPress={() => router.push('/(auth)/customer-signup')}
                disabled={isLoading}>
                <Text className="font-bold text-primary">Create an Account!</Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}