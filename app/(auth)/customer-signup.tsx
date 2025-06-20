import { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Image, TouchableOpacity, SafeAreaView, StatusBar, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../auth-context';
import { Button } from '../../components/Button';
import { TextInput } from '../../components/TextInput';
import { EmailVerificationToast } from '../../components/EmailVerificationToast';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import AuthService from '../../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SignupScreen() {
  const router = useRouter();

  // State management for form inputs
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [countryCode, setCountryCode] = useState('+234');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailToast, setShowEmailToast] = useState(false);

  // Validation helpers
  const isPasswordValid = password.length >= 8;
  const doPasswordsMatch = password === confirmPassword && confirmPassword.length > 0;

  // Handlers
  const handleSignup = async () => {
    AsyncStorage.setItem('userName',firstName+lastName)
    setError('');
    setIsLoading(true);

    try {
      // Validation
      if (!firstName || !lastName || !phoneNumber || !email || !password || !confirmPassword) {
        setError('Please fill in all fields.');
        return;
      }

      if (!isPasswordValid) {
        setError('Password must be at least 8 characters long.');
        return;
      }

      if (!doPasswordsMatch) {
        setError('Passwords do not match.');
        return;
      }

      if (!acceptTerms) {
        setError('Please accept the Terms of Use and Privacy Policy.');
        return;
      }

      // Call API service with frontend form data
      const response = await AuthService.signup({
        firstName,
        lastName,
        email,
        phoneNumber: countryCode + phoneNumber,
        password,
        confirmPassword,
      });

      if (response.success) {
        console.log('Signup successful:', response.data);

        // Clear any previous errors
        setError('');

        // Store user info for meal plan builder
        await AsyncStorage.setItem('userEmail', email);
        await AsyncStorage.setItem('userName', firstName + ' ' + lastName);
        
        // Show email verification toast
        setShowEmailToast(true);
        
        // Navigate to meal plan builder after toast is dismissed (or after delay)
        setTimeout(() => {
          router.push('/meal-plan-builder');
        }, 6500); // Slightly longer than toast duration
      } else {
        setError(response.message || 'Signup failed. Please try again.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  const handleTermsPress = () => {
    console.log('Terms of Use pressed');
    router.push('/(auth)/customer-terms' as any);
  };

  const handlePrivacyPress = () => {
    console.log('Privacy Policy pressed');
    router.push('/(auth)/customer-terms' as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-lightGray">
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* Logo and Welcome Text */}
        <View className="mb-8 mt-20">
          <Image
            source={require('../../assets/icon.png')}
            className="self-center w-24 h-24 mb-6"
            resizeMode="contain"
          />
          <Text style={{ color: colors.primary }} className="text-3xl font-bold text-center">
            Sign Up
          </Text>
          <Text className="text-base text-darkGray mt-2 text-center">
            Create Account To Start Your Journey With Us
          </Text>
        </View>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            padding: 24,
          }}
          keyboardShouldPersistTaps="handled">

          {/* Form Inputs */}
          <TextInput
            placeholder="First Name"
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
            variant={error && !firstName ? 'error' : 'default'}
            editable={!isLoading}
          />

          <TextInput
            placeholder="Last Name"
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="words"
            variant={error && !lastName ? 'error' : 'default'}
            editable={!isLoading}
          />

          {/* Phone Number with Country Code */}
          <View className="mb-4 items-center">
            <View className="flex-row items-center">
              <TouchableOpacity
                className="flex-row items-center bg-white border border-gray rounded-lg px-3 py-4 mr-2"
                onPress={() => console.log('Country picker')}
                disabled={isLoading}>
                <Image
                  source={{ uri: 'https://flagcdn.com/w20/ng.png' }}
                  className="w-5 h-3 mr-2"
                />
                <Text className="text-darkGray font-medium">{countryCode}</Text>
                <Ionicons name="chevron-down" size={16} color={colors.darkGray} className="ml-1" />
              </TouchableOpacity>
              <View className="flex-1 mt-4">
                <TextInput
                  placeholder="803 000 0000"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  variant={error && !phoneNumber ? 'error' : 'default'}
                  editable={!isLoading}
                />
              </View>
            </View>
          </View>

          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            variant={error && !email ? 'error' : 'default'}
            editable={!isLoading}
          />

          {/* Password with validation hint */}
          <View className="mb-4">
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              variant={error && !password ? 'error' : 'default'}
              editable={!isLoading}
            />
            <Text className={`text-xs mt-1 ${isPasswordValid ? 'text-green-600' : 'text-gray-500'}`}>
              Must be at least 8 characters
            </Text>
          </View>

          {/* Confirm Password with validation hint */}
          <View className="mb-4">
            <TextInput
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              variant={error && !confirmPassword ? 'error' : 'default'}
              editable={!isLoading}
            />
            <Text className={`text-xs mt-1 ${doPasswordsMatch ? 'text-green-600' : 'text-gray-500'}`}>
              Both passwords must match
            </Text>
          </View>

          {/* Terms & Privacy Policy */}
          <View className="flex-row items-start mb-6">
            <Pressable
              onPress={() => setAcceptTerms(!acceptTerms)}
              className="mr-3 mt-1"
              disabled={isLoading}>
              <View className={`w-5 h-5 border-2 rounded ${acceptTerms ? 'bg-primary border-primary' : 'border-gray-400'} items-center justify-center`}>
                {acceptTerms && (
                  <Ionicons name="checkmark" size={12} color="white" />
                )}
              </View>
            </Pressable>
            <View className="flex-1">
              <Text className="text-darkGray text-sm leading-5">
                I accept the{' '}
                <Text className="text-primary font-medium" onPress={handleTermsPress}>
                  Terms of Use
                </Text>
                {' & '}
                <Text className="text-primary font-medium" onPress={handlePrivacyPress}>
                  Privacy Policy
                </Text>
              </Text>
            </View>
          </View>

          {error ? <Text className="text-error text-center mb-4">{error}</Text> : null}

          {/* Create Account Button */}
          <View className="mb-6">
            <Button
              title={isLoading ? "Creating Account..." : "Create Account"}
              variant="primary"
              onPress={handleSignup}
              disabled={isLoading}
            />
            {isLoading && (
              <View className="flex-row justify-center mt-2">
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            )}
          </View>

          {/* Already Have Account & Language Selector */}
          <View className="mt-4">
            <View className="flex-row justify-center mb-6">
              <Text className="text-darkGray">Already Have An Account? </Text>
              <TouchableOpacity
                onPress={() => router.push('/(auth)/customer-login')}
                disabled={isLoading}>
                <Text className="font-bold text-primary">Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Email Verification Toast */}
      <EmailVerificationToast
        visible={showEmailToast}
        email={email}
        onClose={() => setShowEmailToast(false)}
      />
    </SafeAreaView>
  );
} 