import { useEffect } from 'react';
import { View, Text, Image, Dimensions, StatusBar, StyleSheet, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { 
  FadeIn, 

  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  withDelay
} from 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function CustomSplashScreen() {
  const colorScheme = useColorScheme(); // Detect device color scheme
  
  // Animation values
  const logoScale = useSharedValue(0.8);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    // Hide the default Expo splash screen
    SplashScreen.hideAsync();
    
    // Start the animation sequence
    startAnimationSequence();
  }, []);

  const startAnimationSequence = () => {
    // Animations
    logoOpacity.value = withTiming(1, { duration: 800 });
    logoScale.value = withSequence(
      withTiming(1.1, { duration: 600 }),
      withTiming(1, { duration: 400 })
    );
    
    textOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));

    // Note: Navigation is handled by the main layout
  };

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  // Determine theme based on color scheme
  const isDarkMode = colorScheme === 'dark';

  return (
    <View style={styles.container}>
      <StatusBar 
        translucent 
        backgroundColor="transparent" 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
      />
      
      <Animated.View 
        style={[isDarkMode ? styles.darkContainer : styles.lightContainer]}
        entering={FadeIn.duration(500)}
      >
        {/* Content */}
        <View style={styles.contentContainer}>
          {/* Logo */}
          <Animated.View style={[styles.logoSection, logoAnimatedStyle]}>
            <Image 
              source={require('../assets/splash-screen.png')} 
              style={styles.logoImage}
              resizeMode="contain"
            />
          </Animated.View>
          
          {/* Text section */}
          <Animated.View style={[styles.textSection, textAnimatedStyle]}>
            <View style={styles.appNameContainer}>
              <Text style={[styles.customText, isDarkMode ? styles.customTextDark : styles.customTextLight]}>Custom </Text>
              <Text style={[styles.diningText, isDarkMode ? styles.diningTextDark : styles.diningTextLight]}>Dining</Text>
            </View>
            <Text style={[styles.tagline, isDarkMode ? styles.taglineDark : styles.taglineLight]}>
              Where Every Plate Meets Your Health Goals
            </Text>
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Dark Theme Container
  darkContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#2F7356',
  },
  
  // Light Theme Container
  lightContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F5F5F0',
  },
  
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  
  logoSection: {
    alignItems: 'center',
    marginBottom: 20, // Further reduced to bring text very close to logo
  },
  
  logoImage: {
    width: 200,
    height: 200,
  },
  
  textSection: {
    alignItems: 'center',
  },
  
  appNameContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8, // Reduced to bring tagline closer
  },
  
  customText: {
    fontSize: 28, // Slightly smaller
    fontWeight: '700',
  },
  
  customTextDark: {
    color: '#a8c7ac', // Original light green for "Custom" on dark theme
  },
  
  customTextLight: {
    color: '#2f7d52', // New darker green for "Custom" on light theme
  },
  
  diningText: {
    fontSize: 28, // Slightly smaller
    fontWeight: '700',
    transform: [{ rotate: '-5deg' }], // Only "Dining" word is angled upward
  },
  
  diningTextDark: {
    color: '#FFD700', // Original gold for "Dining" on dark theme
  },
  
  diningTextLight: {
    color: '#ffca28', // New bright yellow for "Dining" on light theme
  },
  
  tagline: {
    fontSize: 14, // Smaller, nicer font size
    fontWeight: '400', // Lighter weight for elegance
    textAlign: 'center',
    lineHeight: 16, // Tighter line height to keep on one line
    paddingHorizontal: 10, // Reduced padding
    maxWidth: SCREEN_WIDTH - 40, // Ensure it fits on one line
  },
  
  taglineDark: {
    color: '#ffb27c', // Original orange/peach color for tagline on dark theme
  },
  
  taglineLight: {
    color: '#2f7d52', // New darker green for tagline on light theme
  },
});

