import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Image, 
  Dimensions, 
  StatusBar, 
  ImageSourcePropType, 
  Pressable, 
  Platform,
  StyleSheet 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../components/Button';
import { colors } from '../../theme/colors';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Slide {
  id: string;
  image: ImageSourcePropType;
  title: string;
  description: string;
}

const slides: Slide[] = [
  {
    id: '1',
    image: require('../../assets/onboard1.png'),
    title: 'Welcome to Custom Dining',
    description: 'Your companion for healthy, personalized eating—built for Nigerians, by Nigerians.',
  },
  {
    id: '2',
    image: require('../../assets/onboard2.png'),
    title: 'Meals made just for you',
    description: 'Tell us your health goals and dietary needs. We\'ll show you meals that match—low-carb, vegan, or diabetic-friendly.',
  },
  {
    id: '3',
    image: require('../../assets/onboard3.png'),
    title: 'Find restaurants near you',
    description: 'Discover clean meals from trusted kitchens right within your LGA.',
  },
  {
    id: '4',
    image: require('../../assets/onboard4.png'),
    title: 'Ready to eat smarter?',
    description: 'Let\'s help you dine well, feel better, and stay in control.',
  },
];

export default function OnboardingScreen() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentSlideIndex(viewableItems[0].index);
    }
  }).current;

  const handleNext = () => {
    const nextSlideIndex = currentSlideIndex + 1;
    if (nextSlideIndex < slides.length) {
      const offset = nextSlideIndex * SCREEN_WIDTH;
      flatListRef.current?.scrollToOffset({ offset, animated: true });
    } else {
      router.push('/(auth)/customer-signup');
    }
  };

  const handleSkip = () => {
    router.push('/(auth)/customer-signup');
  };

  const SlideItem = ({ item }: { item: Slide }) => (
    <View style={styles.slideContainer}>
      <View style={styles.imageContainer}>
        <Image 
          source={item.image} 
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      <View style={styles.contentCard}>
        <View style={styles.textContent}>
          <Text style={styles.title}>
            {item.title}
          </Text>
          
          <Text style={styles.description}>
            {item.description}
          </Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <Button 
            title={currentSlideIndex === slides.length - 1 ? "Get Started" : "Next"} 
            variant="primary" 
            style={{ width: '100%' }}
            onPress={handleNext} 
          />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <StatusBar 
        translucent 
        backgroundColor="transparent" 
        barStyle="dark-content" 
      />
      
      <View style={styles.mainContent}>
        <FlatList
          ref={flatListRef}
          data={slides}
          renderItem={({ item }) => <SlideItem item={item} />}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
          bounces={false}
          scrollEventThrottle={16}
        />

        <View style={styles.footer}>
          <View style={styles.dotsContainer}>
            {slides.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  {
                    backgroundColor: currentSlideIndex === index ? colors.primary : '#d1d5db',
                    width: currentSlideIndex === index ? 32 : 8,
                  }
                ]}
              />
            ))}
          </View>
          
          <Pressable onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>
              Skip
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  mainContent: {
    flex: 1,
  },
  slideContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#f8f9fa',
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.55,
    backgroundColor: '#e9ecef',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  contentCard: {
    position: 'absolute',
    bottom: 160,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    minHeight: 280,
    justifyContent: 'space-between',
  },
  textContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: '#1a1a1a',
    marginBottom: 12,
    lineHeight: 30,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6c757d',
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  buttonContainer: {
    width: '100%',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 25,
    height: 120,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignSelf: 'flex-start',
  },
  skipText: {
    color: colors.primary,
    fontWeight: '600',
    letterSpacing: 0.5,
    fontSize: 16,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
}); 