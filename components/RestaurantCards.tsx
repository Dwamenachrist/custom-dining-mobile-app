import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.86;
const CARD_HEIGHT = 260;

interface Restaurant {
  id: string;
  name: string;
  image: any;
  rating: number;
  reviewCount: number;
  tags: string[];
  distance: string;
  deliveryTime: string;
}

interface RestaurantCardProps {
  restaurants: Restaurant[];
  onRestaurantPress: (restaurant: Restaurant) => void;
  isLoading: boolean;
}

export default function RestaurantCard({ restaurants, onRestaurantPress, isLoading }: RestaurantCardProps) {
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Finding amazing restaurants...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH}
        snapToAlignment="center"
      >
        {restaurants.map((restaurant, index) => (
          <TouchableOpacity
            key={restaurant.id}
            onPress={() => onRestaurantPress(restaurant)}
            style={[styles.card, { marginLeft: index === 0 ? 16 : 8 }]}
            activeOpacity={0.95}
          >
            {/* Glass background effect */}
            <View style={styles.glassBackground}>
              {/* Restaurant Image */}
              <View style={styles.imageWrapper}>
                <Image source={restaurant.image} style={styles.image} />
                
                {/* Glass overlay on image */}
                <View style={styles.imageGradient} />
                
                {/* Bottom overlay content */}
                <View style={styles.bottomOverlay}>
                  <View style={styles.deliveryTimeContainer}>
                    <Ionicons name="time-outline" size={12} color="#fff" />
                    <Text style={styles.deliveryTime}>{restaurant.deliveryTime}</Text>
                  </View>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={12} color="#FFD700" />
                    <Text style={styles.rating}>{restaurant.rating}</Text>
                  </View>
                </View>
              </View>

              {/* Restaurant Info */}
              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>{restaurant.name}</Text>
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={14} color="#10b981" />
                  <Text style={styles.distance}>{restaurant.distance}</Text>
                  <Text style={styles.reviews}>({restaurant.reviewCount}+ reviews)</Text>
                </View>
                
                {/* Tags */}
                <View style={styles.tags}>
                  {restaurant.tags.slice(0, 2).map((tag, tagIndex) => (
                    <View key={tagIndex} style={styles.tagContainer}>
                      <Text style={styles.tag}>{tag}</Text>
                    </View>
                  ))}
                  {restaurant.tags.length > 2 && (
                    <View style={styles.moreTagsContainer}>
                      <Text style={styles.moreTags}>+{restaurant.tags.length - 2}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
    marginHorizontal: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  container: {
    marginTop: 8,
  },
  scrollContent: {
    paddingRight: 16,
  },
  card: {
    width: width * 0.85,
    marginRight: 16,
    borderRadius: 20,
    overflow: 'hidden',
    // Solid glass elevation
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    shadowOffset: {
      width: 0,
      height: 15,
    },
    shadowOpacity: 0.35,
    shadowRadius: 25,
    
    marginVertical: 8,
  },
  glassBackground: {
    // True solid glass background
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    // Inner glass glow
    shadowColor: 'rgba(255, 255, 255, 0.3)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
  imageWrapper: {
    position: 'relative',
    height: 170,
    
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 10,
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deliveryTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  deliveryTime: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  rating: {
    color: '#1a1a1a',
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 4,
  },
  info: {
    padding: 18,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  distance: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
    marginLeft: 4,
    marginRight: 8,
  },
  reviews: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  tagContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    marginRight: 6,
    marginBottom: 4,
  },
  tag: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '600',
  },
  moreTagsContainer: {
    backgroundColor: 'rgba(107, 114, 128, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(107, 114, 128, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    marginRight: 6,
    marginBottom: 4,
  },
  moreTags: {
    color: '#6b7280',
    fontSize: 10,
    fontWeight: '600',
  },
}); 