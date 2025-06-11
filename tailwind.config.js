/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,tsx}', './components/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#2D6A4F',
        secondary: '#40916C',
        accent: '#F9844A',
        warning: '#F9C74F',
        black: '#22223B',
        darkGray: '#4A4E69',
        gray: '#8D99AE',
        white: '#F8F9FA',
        lightGray: '#EDF2F4',
        error: '#D90429',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
