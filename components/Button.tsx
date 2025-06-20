import { forwardRef } from 'react';
import { Text, TouchableOpacity, TouchableOpacityProps, View, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';

// Button variants based on the design system
const VARIANT_CLASSES = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  accent: 'bg-accent',
  warning: 'bg-warning',
  error: 'bg-error',
  outline: 'border-2 border-primary bg-white',
  outlineError: 'border-2 border-error bg-white',
  outlineGray: 'border-2 border-gray bg-white',
  dark: 'bg-black',
};

const VARIANT_TEXT_CLASSES = {
  primary: 'text-white',
  secondary: 'text-white',
  accent: 'text-white',
  warning: 'text-black',
  error: 'text-white',
  outline: 'text-primary',
  outlineError: 'text-error',
  outlineGray: 'text-gray',
  dark: 'text-white',
};

type ButtonProps = {
  title: string;
  variant?: keyof typeof VARIANT_CLASSES;
  loading?: boolean;
} & TouchableOpacityProps;

export const Button = forwardRef<View, ButtonProps>(
  ({ 
    title, 
    variant = 'primary', 
    style, 
    className = '', 
    disabled, 
    loading = false,
    ...touchableProps 
  }, ref) => {
    
    // If disabled or loading, override styles to gray
    const isDisabled = disabled || loading;
    const buttonClass = isDisabled
      ? 'bg-gray-300'
      : VARIANT_CLASSES[variant] + '';
    const textClass = isDisabled
      ? 'text-gray-500'
      : VARIANT_TEXT_CLASSES[variant];

    return (
      <TouchableOpacity
        ref={ref}
        {...touchableProps}
        disabled={isDisabled}
        style={[
          styles.button, 
          isDisabled && { backgroundColor: colors.gray }, 
          style
        ]}
        className={`
          ${buttonClass} 
          rounded-xl 
          shadow-sm 
          px-8 py-4
          ${className}
          ${isDisabled ? 'opacity-60' : 'active:opacity-80'}
        `}
        activeOpacity={0.8}
      >
        <View className="flex-row items-center justify-center">
          {loading && (
            <ActivityIndicator 
              size="small" 
              color={isDisabled ? colors.gray : (variant === 'outline' ? colors.primary : 'white')} 
              className="mr-2"
            />
          )}
        <Text
            className={`font-semibold text-center ${textClass}`}
            style={styles.buttonText}
        >
            {loading ? 'Loading...' : title}
        </Text>
        </View>
      </TouchableOpacity>
    );
  }
);

Button.displayName = 'Button';

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
