import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, TextInput, SafeAreaView, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAuth } from '../auth-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Review {
  id: string;
  userName: string;
  userImage: any;
  rating: number;
  timeAgo: string;
  comment: string;
  verified?: boolean;
}

const sampleReviews: Review[] = [
  {
    id: '1',
    userName: 'Vivian Eze',
    userImage: require('../assets/profile.png'),
    rating: 5,
    timeAgo: '2 mins ago',
    comment: 'Loved the grilled veggie wrap  tasty, filling, and didn\'t spike my sugar. Finally, a place I can trust!',
    verified: true
  },
  {
    id: '2',
    userName: 'Victor Adewale',
    userImage: require('../assets/profile copy.png'),
    rating: 4,
    timeAgo: '15 mins ago',
    comment: 'So glad I found this! The tofu bowl was fresh and flavorful, and 100% plant-based. I\'ll be back!',
    verified: true
  },
  {
    id: '3',
    userName: 'Sarah Johnson',
    userImage: require('../assets/profile.png'),
    rating: 5,
    timeAgo: '1 hour ago',
    comment: 'Amazing healthy options! The salmon dish was perfectly cooked and the portion size was just right.',
    verified: false
  },
  {
    id: '4',
    userName: 'Michael Chen',
    userImage: require('../assets/profile copy.png'),
    rating: 4,
    timeAgo: '3 hours ago',
    comment: 'Great service and fresh ingredients. Will definitely order again!',
    verified: true
  },
  {
    id: '5',
    userName: 'Aisha Mahmoud',
    userImage: require('../assets/profile.png'),
    rating: 5,
    timeAgo: '5 hours ago',
    comment: 'Perfect for my dietary needs. Love that they have so many diabetic-friendly options.',
    verified: true
  },
  {
    id: '6',
    userName: 'David Wright',
    userImage: require('../assets/profile copy.png'),
    rating: 4,
    timeAgo: '1 day ago',
    comment: 'Delicious and nutritious meals. The avocado toast was exceptional!',
    verified: false
  },
  {
    id: '7',
    userName: 'Fatima Ali',
    userImage: require('../assets/profile.png'),
    rating: 5,
    timeAgo: '1 day ago',
    comment: 'Fantastic variety of healthy meals. The delivery was quick too!',
    verified: true
  },
  {
    id: '8',
    userName: 'James Wilson',
    userImage: require('../assets/profile copy.png'),
    rating: 3,
    timeAgo: '2 days ago',
    comment: 'Good food overall, but could use a bit more seasoning. Still healthy and fresh though.',
    verified: false
  },
  {
    id: '9',
    userName: 'Kemi Okonkwo',
    userImage: require('../assets/profile.png'),
    rating: 5,
    timeAgo: '3 days ago',
    comment: 'Excellent quality and taste! This is my go-to for healthy meals now.',
    verified: true
  },
  {
    id: '10',
    userName: 'Robert Taylor',
    userImage: require('../assets/profile copy.png'),
    rating: 4,
    timeAgo: '1 week ago',
    comment: 'Great concept and execution. The Mediterranean bowl was delicious and filling.',
    verified: true
  }
];

const ratingDistribution = {
  5: 0.6, // 60%
  4: 0.3, // 30%
  3: 0.1, // 10%
  2: 0.0, // 0%
  1: 0.0  // 0%
};

export default function ReviewsScreen() {
  const router = useRouter();
  const { itemName = 'This Item' } = useLocalSearchParams();
  const { isLoggedIn, user } = useAuth();
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [reviews, setReviews] = useState<Review[]>(sampleReviews);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  const totalReviews = reviews.length;
  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews;

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setIsLoading(true);
      // In a real app, this would fetch from an API
      // For now, we'll use the sample reviews
      const sortedReviews = sortReviews(sampleReviews, sortBy);
      setReviews(sortedReviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sortReviews = (reviewsToSort: Review[], sortType: string): Review[] => {
    const sorted = [...reviewsToSort];
    switch (sortType) {
      case 'newest':
        return sorted; // Already in newest first order
      case 'oldest':
        return sorted.reverse();
      case 'highest':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'lowest':
        return sorted.sort((a, b) => a.rating - b.rating);
      default:
        return sorted;
    }
  };

  const handleSortChange = (newSort: 'newest' | 'oldest' | 'highest' | 'lowest') => {
    setSortBy(newSort);
    const sortedReviews = sortReviews(reviews, newSort);
    setReviews(sortedReviews);
  };

  const renderStars = (rating: number, size: number = 16, interactive: boolean = false) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= rating;
      const isHalf = i - 0.5 <= rating && i > rating;
      
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={interactive ? () => handleStarPress(i) : undefined}
          disabled={!interactive}
          style={{ marginRight: 2 }}
        >
          <Ionicons 
            name={isFilled ? "star" : isHalf ? "star-half" : "star-outline"} 
            size={size} 
            color={isFilled || isHalf ? "#FDD835" : "#E5E5E5"} 
          />
        </TouchableOpacity>
      );
    }
    return <View style={{ flexDirection: 'row' }}>{stars}</View>;
  };

  const renderRatingBar = (starCount: number, percentage: number) => (
    <View style={{ 
      flexDirection: 'row', 
      alignItems: 'center', 
      marginBottom: 4 
    }}>
      <Text style={{ 
        fontSize: 14, 
        color: colors.darkGray, 
        width: 12, 
        marginRight: 12 
      }}>
        {starCount}
      </Text>
      <Ionicons name="star" size={14} color="#FDD835" />
      <View style={{ 
        flex: 1, 
        marginHorizontal: 12,
        height: 8,
        backgroundColor: colors.lightGray,
        borderRadius: 4
      }}>
        <View 
          style={{ 
            height: 8, 
            backgroundColor: colors.primary, 
            borderRadius: 4,
            width: `${percentage * 100}%`
          }}
        />
      </View>
      <Text style={{ 
        fontSize: 12, 
        color: colors.darkGray,
        width: 30
      }}>
        {Math.round(percentage * 100)}%
      </Text>
    </View>
  );

  const handleStarPress = (rating: number) => {
    setUserRating(rating);
  };

  const handleSubmitReview = async () => {
    if (!isLoggedIn) {
      Alert.alert(
        'Login Required',
        'Please log in to submit a review.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => router.push('/(auth)/customer-login') }
        ]
      );
      return;
    }

    if (userRating === 0) {
      Alert.alert('Rating Required', 'Please select a rating before submitting your review.');
      return;
    }

    if (userReview.trim().length < 10) {
      Alert.alert('Review Too Short', 'Please write at least 10 characters for your review.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create new review
      const newReview: Review = {
        id: Date.now().toString(),
        userName: user?.email?.split('@')[0] || 'Anonymous User',
        userImage: require('../assets/profile.png'),
        rating: userRating,
        timeAgo: 'Just now',
        comment: userReview.trim(),
        verified: user?.isEmailVerified || false
      };

      // Add to reviews list
      setReviews(prev => [newReview, ...prev]);
      
      // Store review locally
      const storedReviews = await AsyncStorage.getItem('userReviews');
      const existingReviews = storedReviews ? JSON.parse(storedReviews) : [];
      existingReviews.push(newReview);
      await AsyncStorage.setItem('userReviews', JSON.stringify(existingReviews));
      
      // Reset form
      setUserRating(0);
      setUserReview('');
      
      Alert.alert(
        'Review Submitted!',
        'Thank you for your feedback. Your review has been added.',
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.lightGray }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.lightGray} />
      
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 48,
        paddingBottom: 16
      }}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={{ padding: 8 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.black} />
        </TouchableOpacity>
        <Text style={{ 
          fontSize: 18, 
          fontWeight: '600', 
          color: colors.black 
        }}>
          Reviews & Rating
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={{ flex: 1, paddingHorizontal: 20 }} 
        showsVerticalScrollIndicator={false}
      >
        {/* Rating Overview */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          backgroundColor: colors.white,
          borderRadius: 16,
          padding: 20,
          marginBottom: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2
        }}>
          {/* Rating Breakdown */}
          <View style={{ flex: 1, paddingRight: 16 }}>
            {renderRatingBar(5, ratingDistribution[5])}
            {renderRatingBar(4, ratingDistribution[4])}
            {renderRatingBar(3, ratingDistribution[3])}
            {renderRatingBar(2, ratingDistribution[2])}
            {renderRatingBar(1, ratingDistribution[1])}
          </View>

          {/* Overall Rating */}
          <View style={{ alignItems: 'center' }}>
            <Text style={{ 
              fontSize: 36, 
              fontWeight: 'bold', 
              color: colors.black, 
              marginBottom: 4 
            }}>
              {averageRating.toFixed(1)}
            </Text>
            {renderStars(Math.round(averageRating), 20)}
            <Text style={{ 
              fontSize: 14, 
              color: colors.darkGray, 
              marginTop: 4 
            }}>
              {totalReviews} Reviews
            </Text>
          </View>
        </View>

        {/* Write Review Section */}
        {isLoggedIn && (
          <View style={{
            backgroundColor: colors.white,
            borderRadius: 16,
            padding: 20,
            marginBottom: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2
          }}>
            <Text style={{ 
              fontSize: 16, 
              fontWeight: '600', 
              color: colors.black, 
              marginBottom: 12 
            }}>
              Write a Review
            </Text>
            
            <Text style={{ 
              fontSize: 14, 
              color: colors.darkGray, 
              marginBottom: 8 
            }}>
              Rate your experience:
            </Text>
            
            {renderStars(userRating, 24, true)}
            
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: colors.gray,
                borderRadius: 8,
                padding: 12,
                marginTop: 12,
                marginBottom: 16,
                minHeight: 80,
                textAlignVertical: 'top',
                fontSize: 14,
                color: colors.black
              }}
              placeholder="Share your experience with this item..."
              placeholderTextColor={colors.darkGray}
              value={userReview}
              onChangeText={setUserReview}
              multiline
              numberOfLines={4}
            />
            
            <TouchableOpacity
              style={{
                backgroundColor: userRating > 0 && userReview.trim() ? colors.primary : colors.gray,
                borderRadius: 8,
                paddingVertical: 12,
                alignItems: 'center',
                opacity: isSubmitting ? 0.7 : 1
              }}
              onPress={handleSubmitReview}
              disabled={isSubmitting || userRating === 0 || !userReview.trim()}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={{ 
                  color: colors.white, 
                  fontSize: 16, 
                  fontWeight: '600' 
                }}>
                  Submit Review
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Sort Options */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16
        }}>
          <Text style={{ 
            fontSize: 16, 
            fontWeight: '600', 
            color: colors.black 
          }}>
            All Reviews ({totalReviews})
          </Text>
          
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.white,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.gray
            }}
            onPress={() => {
              // Show sort options
              Alert.alert(
                'Sort Reviews',
                'Choose how to sort reviews',
                [
                  { text: 'Newest First', onPress: () => handleSortChange('newest') },
                  { text: 'Oldest First', onPress: () => handleSortChange('oldest') },
                  { text: 'Highest Rated', onPress: () => handleSortChange('highest') },
                  { text: 'Lowest Rated', onPress: () => handleSortChange('lowest') },
                  { text: 'Cancel', style: 'cancel' }
                ]
              );
            }}
          >
            <Text style={{ fontSize: 14, color: colors.primary, marginRight: 4 }}>
              Sort
            </Text>
            <Ionicons name="chevron-down" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Individual Reviews */}
        {isLoading ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ marginTop: 12, color: colors.darkGray }}>
              Loading reviews...
            </Text>
          </View>
        ) : (
          reviews.map((review) => (
            <View
              key={review.id}
              style={{
                backgroundColor: colors.white,
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <Image 
                  source={review.userImage} 
                  style={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: 20, 
                    marginRight: 12 
                  }} 
                />
                <View style={{ flex: 1 }}>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 4
                  }}>
                    <Text style={{ 
                      fontSize: 15, 
                      fontWeight: '600', 
                      color: colors.black,
                      marginRight: 8
                    }}>
                      {review.userName}
                    </Text>
                    {review.verified && (
                      <View style={{
                        backgroundColor: colors.primary,
                        borderRadius: 8,
                        paddingHorizontal: 6,
                        paddingVertical: 2
                      }}>
                        <Text style={{ 
                          fontSize: 10, 
                          color: colors.white, 
                          fontWeight: '500' 
                        }}>
                          Verified
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    marginBottom: 8 
                  }}>
                    {renderStars(review.rating, 16)}
                    <Text style={{ 
                      fontSize: 12, 
                      color: colors.darkGray, 
                      marginLeft: 8 
                    }}>
                      {review.timeAgo}
                    </Text>
                  </View>
                  
                  <Text style={{ 
                    fontSize: 14, 
                    color: colors.black, 
                    lineHeight: 20 
                  }}>
                    {review.comment}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
        
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
