import { forwardRef } from 'react';
import { Text, TouchableOpacity, TouchableOpacityProps, View, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

// Button variants based on the design system
const VARIANT_CLASSES = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  accent: 'bg-accent',
  warning: 'bg-warning',
  error: 'bg-error',
  outline: 'border border-primary bg-white',
  outlineError: 'border border-error bg-white',
  outlineGray: 'border border-gray bg-white',
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
} & TouchableOpacityProps;

export const Button = forwardRef<View, ButtonProps>(
  ({ title, variant = 'primary', style, className = '', ...touchableProps }, ref) => {
    return (
      <TouchableOpacity
        ref={ref}
        {...touchableProps}
        style={[styles.button, style]}
        className={`${VARIANT_CLASSES[variant]} rounded-[28px] shadow-md p-4 ${className}`}
      >
        <Text
          className={`text-lg font-semibold text-center ${VARIANT_TEXT_CLASSES[variant]}`}
          style={styles.buttonText}
        >
          {title}
        </Text>
      </TouchableOpacity>
    );
  }
);

Button.displayName = 'Button';

const styles = StyleSheet.create({
  button: {
    borderRadius: 28,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});
