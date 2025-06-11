import React, { forwardRef, useState } from 'react';
import {TextInput as RNTextInput,  TextInputProps,  View,  Text,  TouchableOpacity} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

type Props = TextInputProps & {
  label?: string;
  errorMessage?: string;
  variant?: 'default' | 'error' | 'success';
  containerClassName?: string;
};

export const TextInput = forwardRef<RNTextInput, Props>(
  (
    { label, errorMessage, variant = 'default', containerClassName = '', style, ...props },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(!props.secureTextEntry);

    const getBorderColor = () => {
      if (variant === 'error') return colors.error;
      if (variant === 'success') return colors.secondary;
      if (isFocused) return colors.primary;
      return colors.gray;
    };

    const handleFocus = (e: any) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    return (
      <View className={`mb-4 w-full ${containerClassName}`}>
        {label && <Text className="mb-1 font-bold text-darkGray">{label}</Text>}
        <View
          className="flex-row items-center rounded-lg border bg-white"
          style={{ borderColor: getBorderColor(), borderWidth: 1.5 }}>
          <RNTextInput
            ref={ref}
            className="flex-1 p-3 text-base text-black"
            placeholderTextColor={colors.gray}
            {...props}
            secureTextEntry={!isPasswordVisible}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={style}
          />
          {props.secureTextEntry && (
            <TouchableOpacity
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              className="p-2 mr-1">
              <Ionicons
                name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                size={24}
                color={colors.gray}
              />
            </TouchableOpacity>
          )}
          {variant === 'success' && (
            <View className="p-2 mr-1">
              <Ionicons name="checkmark-circle" size={24} color={colors.secondary} />
            </View>
          )}
          {variant === 'error' && (
            <View className="p-2 mr-1">
              <Ionicons name="close-circle" size={24} color={colors.error} />
            </View>
          )}
        </View>
        {errorMessage && <Text className="mt-1 text-error">{errorMessage}</Text>}
      </View>
    );
  }
);

TextInput.displayName = 'TextInput';