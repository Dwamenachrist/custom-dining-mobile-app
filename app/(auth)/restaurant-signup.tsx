import React from 'react';
import { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Image, TouchableOpacity, SafeAreaView, StatusBar, Pressable, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Button } from '../../components/Button';
import { TextInput } from '../../components/TextInput';
import { EmailVerificationToast } from '../../components/EmailVerificationToast';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import AuthService from '../../services/authService';
import { Picker } from '@react-native-picker/picker';
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
  const [certUploaded, setCertUploaded] = useState(false);
  const [certFiles, setCertFiles] = useState<string[]>([]);
  const [showEmailToast, setShowEmailToast] = useState(false);

  // Add city dropdown options
  const cityOptions = ['Lagos', 'Abuja', 'Port Harcourt', 'Kano'];
  const [city, setCity] = useState('');

  // Validation helpers
  const isPasswordValid = password.length >= 8;
  const doPasswordsMatch = password === confirmPassword && confirmPassword.length > 0;

  // When returning from upload-certifications, check if cert was uploaded
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        const uploaded = await AsyncStorage.getItem('certUploaded');
        setCertUploaded(uploaded === 'true');
        const files = await AsyncStorage.getItem('certFiles');
        setCertFiles(files ? JSON.parse(files) : []);
      })();
    }, [])
  );

  // Handlers
  const handleSignup = async () => {
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

        // Show email verification toast
        setShowEmailToast(true);
        
        // Navigate to login after toast is dismissed (or after delay)
        setTimeout(() => {
          router.push('/(auth)/restaurant-login');
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

  const handleLanguageChange = () => {
    console.log('Language change pressed');
  };

  const handleTermsPress = () => {
    console.log('Terms of Use pressed');
    router.push('/restaurant-terms');
  };

  const handlePrivacyPress = () => {
    console.log('Privacy Policy pressed');
    router.push('/restaurant-terms');
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
          <Text className="text-base self-center text-darkGray mt-2 text-center ">
          Lets help you serve the right meals to the {'\n'}right customers.
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
            placeholder="Business Name"
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
            variant={error && !firstName ? 'error' : 'default'}
            editable={!isLoading}
          />

          <TextInput
            placeholder="Business Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            variant={error && !email ? 'error' : 'default'}
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
            placeholder="Business Address"
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="words"
            variant={error && !lastName ? 'error' : 'default'}
            editable={!isLoading}
          />

          <View className="mb-4">
            <View className="border border-gray rounded-lg bg-white">
              <Picker
                selectedValue={city}
                onValueChange={setCity}
                enabled={!isLoading}
                style={{ height: 54 }}>
                <Picker.Item label="Select City" value="" />
                {cityOptions.map((option) => (
                  <Picker.Item key={option} label={option} value={option} />
                ))}
              </Picker>
            </View>
          </View>

          <TouchableOpacity
            className="flex-row items-center border border-gray rounded-lg px-3 py-4 bg-white mb-1"
            onPress={async () => {
              // Clear flag before navigating
              await AsyncStorage.removeItem('certUploaded');
              await AsyncStorage.removeItem('certFiles');
              router.push('/upload-certifications');
            }}
            disabled={isLoading}
          >
            <Ionicons name="attach" size={20} color={colors.primary} className="mr-2" />
            <Text className="text-darkGray">
              {certFiles.length === 2 ? '2 files attached' : certUploaded ? 'Certification uploaded' : 'Upload Certifications'}
            </Text>
          </TouchableOpacity>
          {certFiles.length === 2 && (
            <View style={{ marginBottom: 12, marginLeft: 8 }}>
              {certFiles.map((name, idx) => (
                <Text key={idx} style={{ color: colors.primary, fontSize: 13 }}>
                  {name}
                </Text>
              ))}
            </View>
          )}

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
              <Text className="text-darkGray text-sm leading-5" >
                I accept the{' '}
                <Text className="text-primary font-medium" onPress={() => router.push('/restaurant-terms')}>
                  Terms of Use & Privacy Policy
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
              disabled={isLoading || !certUploaded || !firstName || !lastName || !phoneNumber || !email || !password || !confirmPassword || !acceptTerms}
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
                onPress={() => router.push('/(auth)/restaurant-login')}
                disabled={isLoading}>
                <Text className="font-bold text-primary">Sign In</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={handleLanguageChange}
              className="flex-row self-center items-center"
              disabled={isLoading}>
              <Text className="text-darkGray">English</Text>
              <Ionicons name="chevron-down" size={16} color={colors.darkGray} />
            </TouchableOpacity>
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