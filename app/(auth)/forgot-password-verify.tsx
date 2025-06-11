import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, StatusBar, ActivityIndicator, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button } from '../../components/Button';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import AuthService from '../../services/authService';

export default function ForgotPasswordVerifyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Extract params
  const method = params.method as 'mobile' | 'email';
  const contact = params.contact as string;

  // State management
  const [otp, setOtp] = useState(['', '', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(60);

  // Refs for OTP inputs
  const otpRefs = useRef<(TextInput | null)[]>([]);

  // Timer countdown for resend
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  // Handle OTP input change
  const handleOtpChange = (value: string, index: number) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        otpRefs.current[index + 1]?.focus();
      }
    }
  };

  // Handle backspace
  const handleKeyPress = (event: any, index: number) => {
    if (event.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Handle verify OTP
  const handleVerifyOTP = async () => {
    setError('');
    setIsLoading(true);
    router.push('/(auth)/reset-password');

    // try {
    //   const otpCode = otp.join('');

    //   if (otpCode.length !== 5) {
    //     setError('Please enter the complete 5-digit verification code.');
    //     return;
    //   }

    //   console.log('🔐 Verifying OTP:', otpCode);

    //   // Call API service
    //   const response = await AuthService.verifyOTP(contact, otpCode, method);

    //   if (response.success) {
    //     console.log('✅ OTP verified successfully');
    //     // Navigate to reset password screen
    //     router.push({
    //       pathname: '/(auth)/reset-password',
    //       params: { 
    //         token: response.data?.resetToken || '',
    //         contact: contact 
    //       }
    //     });
    //   } else {
    //     setError(response.message || 'Invalid verification code. Please try again.');
    //     // Clear OTP inputs on error
    //     setOtp(['', '', '', '', '', '']);
    //     otpRefs.current[0]?.focus();
    //   }
    // } catch (error) {
    //   console.error('❌ Verify OTP error:', error);
    //   setError('An unexpected error occurred. Please try again.');
    // } finally {
    //   setIsLoading(false);
    // }
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    setIsResending(true);
    setError('');

    try {
      console.log('🔄 Resending OTP to:', contact);

      const response = method === 'mobile' 
        ? await AuthService.sendOTPToMobile(contact)
        : await AuthService.sendOTPToEmail(contact);

      if (response.success) {
        console.log('✅ OTP resent successfully');
        setTimer(60); // Reset timer
        // Clear current OTP
        setOtp(['', '', '', '', '', '']);
        otpRefs.current[0]?.focus();
      } else {
        setError(response.message || 'Failed to resend OTP. Please try again.');
      }
    } catch (error) {
      console.error('❌ Resend OTP error:', error);
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const formatContact = (contact: string) => {
    if (method === 'mobile') {
      return contact.replace(/(\d{3})(\d{3})(\d+)/, '$1-$2-$3');
    }
    return contact;
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      
      {/* Header with Back Button */}
      <View className="flex-row items-center p-6 pt-12">
        <TouchableOpacity onPress={handleBack} className="mr-4">
          <Ionicons name="arrow-back" size={24} color={colors.darkGray} />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-darkGray">Verify Code</Text>
      </View>

      <View className="flex-1 px-6">
        {/* Icon and Title */}
        <View className="items-center mt-8 mb-8">
          <View className="w-287 h-287 items-center justify-center mb-6">
            <Image source={require('../../assets/verify-code.png')} className="w-280 h-280" />
          </View>
          <Text className="text-2xl font-bold text-center mb-4 text-gray-800">
            Enter Verification Code
          </Text>
          <Text className="text-base text-gray-500 text-center leading-6">
            We sent a 5-digit code to{'\n'}
            <Text className="font-semibold text-gray-700">
              {formatContact(contact)}
            </Text>
          </Text>
        </View>

        {/* OTP Input */}
        <View className="flex-row justify-center mb-8">
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => otpRefs.current[index] = ref as any}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(event) => handleKeyPress(event, index)}
              keyboardType="numeric"
              maxLength={1}
              className={`w-[50px] h-[56px] border-2 rounded-lg text-center text-xl font-bold mx-2 ${
                digit 
                  ? 'border-green-500 bg-green-50' 
                  : error 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 bg-gray-50'
              }`}
              style={{ color: colors.darkGray }}
              editable={!isLoading && !isResending}
            />
          ))}
        </View>

        {/* Error Messages */}
        {error ? (
          <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <Text className="text-red-600 text-center">{error}</Text>
          </View>
        ) : null}

        {/* Verify Button */}
        
          <Button
            title={isLoading ? "Verifying..." : "Verify OTP"}
            variant={otp.join('').length === 5 ? "primary" : "outlineGray"}
            onPress={handleVerifyOTP}
            // disabled={isLoading || otp.join('').length !== 6}
          />
          {isLoading && (
            <View className="flex-row justify-center mt-2">
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          )}
        

        {/* Resend Code */}
        <View className="items-center mt-6">
          <View className="flex-row items-center">
            <Text className="text-gray-500 mr-2">OTP not received?</Text>
            {timer > 0 ? (
              <Text className="text-gray-400">Resend code in {timer} seconds</Text>
            ) : (
              <Button
                title={isResending ? "Sending..." : "Resend"}
                variant="outline"
                onPress={handleResendOTP}
                disabled={isResending}
                className='px-3 py-1'
              />
            )}
          </View>
          {isResending && (
            <View className="mt-2">
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}