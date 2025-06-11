import { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, ActivityIndicator, Image, TextInput as RNTextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../components/Button';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import AuthService from '../../services/authService';

export default function ForgotPasswordMobileScreen() {
  const router = useRouter();

  // State management
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+234');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Validation helper
  const cleanPhoneNumber = phoneNumber.replace(/\D/g, ''); // Remove spaces for validation
  const isPhoneValid = cleanPhoneNumber.length >= 10;

  // Format phone number as user types
  const formatPhoneNumber = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    
    // Format as XXX XXX XXXX
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (match) {
      return [match[1], match[2], match[3]].filter(Boolean).join(' ');
    }
    return cleaned;
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhoneNumber(formatted);
  };

  // Handle send OTP
  const handleSendOTP = async () => {
    setError('');
    setIsLoading(true);
    router.push({
      pathname: '/(auth)/forgot-password-verify',
      params: { 
        method: 'mobile',
        contact: countryCode + cleanPhoneNumber 
      }
    });
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
        <Text className="text-lg font-semibold text-darkGray">Mobile Number</Text>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            padding: 24,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* Icon and Title */}
          <View className="items-center mb-8 mt-8">
            <View className="items-center justify-center mb-6">
              <Image 
                source={require('../../assets/phone-number.png')} 
                className="w-277 h-277" 
                resizeMode="contain"
              />
            </View>
            <Text className="text-2xl font-bold text-center mb-2 text-gray-800">
              Enter Mobile Number
            </Text>
            <Text className="text-base text-gray-500 text-center leading-6 px-4">
              Enter the mobile number used for registration
            </Text>
          </View>

          {/* Phone Number Input */}
          <View className="mb-6">
            <View className="flex-row items-center border border-gray-300 rounded-lg overflow-hidden">
              {/* Country Code Selector */}
              <TouchableOpacity 
                className="flex-row items-center px-3 py-4 border-r border-gray-300"
                onPress={() => {
                  // TODO: Open country picker modal
                  console.log('Open country picker');
                }}>
                <Text className="text-2xl mr-2">🇳🇬</Text>
                <Text className="text-base font-medium text-gray-700 mr-1">
                  {countryCode}
                </Text>
                <Ionicons name="chevron-down" size={16} color={colors.gray} />
              </TouchableOpacity>

              {/* Phone Number Input */}
              <View className="flex-1">
                <RNTextInput
                  placeholder="803 000 0000"
                  value={phoneNumber}
                  onChangeText={handlePhoneChange}
                  keyboardType="phone-pad"
                  className="px-4 py-4 text-base text-gray-800"
                  style={{ fontSize: 16 }}
                  editable={!isLoading}
                  maxLength={13} // XXX XXX XXXX format
                />
              </View>
            </View>
            
            {phoneNumber && (
              <Text className={`text-xs mt-2 ${isPhoneValid ? 'text-green-600' : 'text-gray-500'}`}>
                {isPhoneValid ? '✓ Valid mobile number' : 'Please enter a valid mobile number (at least 10 digits)'}
              </Text>
            )}
          </View>

          {/* Error Messages */}
          {error ? (
            <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <Text className="text-red-600 text-center">{error}</Text>
            </View>
          ) : null}

          {/* Spacer to push button down */}
          <View className="flex-1 min-h-[100px]" />

          {/* Send OTP Button */}
          <View className="mt-8 mb-8">
            <Button
              title={isLoading ? "Sending OTP..." : "Send OTP"}
              variant="primary"
              onPress={handleSendOTP}
              disabled={isLoading || !phoneNumber}
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