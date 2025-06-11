import React, { useState, useRef } from 'react';
import { View, Text, FlatList, Image, Dimensions, SafeAreaView, StatusBar, ImageSourcePropType, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../components/Button';
import { colors } from '~/theme/colors';

// Get the screen dimensions for the FlatList
const { width, height } = Dimensions.get('window');

// --- Onboarding Data ---
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
    description: 'Tell us your health goals and dietary needs. We’ll show you meals that match—low-carb, vegan, or diabetic-friendly.',
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
    description: 'Let’s help you dine well, feel better, and stay in control.',
  },
];




// --- Main Onboarding Screen ---
export default function OnboardingScreen() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const router = useRouter(); // Using Expo Router's hook
  const flatListRef = useRef<FlatList>(null);

  // Update the active dot indicator on scroll
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentSlideIndex(viewableItems[0].index);
    }
  }).current;

  // Navigate to the next slide or to the signup screen
  const handleNext = () => {
    const nextSlideIndex = currentSlideIndex + 1;
    if (nextSlideIndex < slides.length) {
      const offset = nextSlideIndex * width;
      flatListRef.current?.scrollToOffset({ offset, animated: true });
    } else {
      // On the last slide, "Get Started" button navigates to signup
      router.push('/(auth)/login'); // Navigate to signup screen
    }
  };

  // Handle the skip action
  const handleSkip = () => {
    // Navigate directly to the signup screen
    router.push('/(auth)/login'); // Navigate to signup screen
  };


  const SlideItem = ({ item }: { item: Slide }) => {
    return (
      <View className="relative items-center" style={{ width: width, height: height * 0.85 }}>
        {/* Background Image */}
        <Image source={item.image} className="h-[70%] w-full" resizeMode="cover" />

        {/* White Card with Text */}
        <View
          className="absolute bottom-[3%] w-[90%] bg-white rounded-3xl pl-8 pr-8 pt-6 pb-8 items-center"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 10,
            elevation: 8,
          }}>
          <Text className="text-2xl font-bold text-center text-black">{item.title}</Text>
          <Text className="text-center text-darkGray mt-4 leading-6">{item.description}</Text>
          <View className="w-full pt-8">
            <Button 
              title={currentSlideIndex === slides.length - 1 ? "Get Started" : "Next"} 
              variant="primary" 
              onPress={handleNext} 
            />
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      {/* Swipeable slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={({ item }) => <SlideItem item={item} />}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
        }}
      />

      {/* Footer with dots and buttons */}
      <View className="px-6 pb-8 pt-4">
        {/* Dot Indicators */}
        <View className="flex-row justify-center items-center mb-8">
          {slides.map((_, index) => (
            <View
              key={index}
              className={`h-2 rounded-full mx-1 ${currentSlideIndex === index ? 'bg-primary w-6' : 'bg-gray w-2'
                }`}
            />
          ))}
        </View>

        {/* Skip Button */}
        <View className="flex-row justify-start">
          <Pressable onPress={handleSkip}>
            <Text style={{ color: colors.primary }} className="text-base font-medium">
              SKIP
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}