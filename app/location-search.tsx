import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useRouter } from 'expo-router';
import { Button } from '../components/Button';

export default function LocationSearchScreen() {
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [selectedState, setSelectedState] = useState('');
  const [selectedLGA, setSelectedLGA] = useState('');
  const [searchRadius, setSearchRadius] = useState(2); // in km
  const router = useRouter();

  const handleReset = () => {
    setUseCurrentLocation(true);
    setSelectedState('');
    setSelectedLGA('');
    setSearchRadius(2);
  };

  const handleApplyLocation = () => {
    // Apply location filters and go back
    console.log('Applied location filters:', {
      useCurrentLocation,
      selectedState,
      selectedLGA,
      searchRadius
    });
    router.back();
  };

  const handleApplyRadius = () => {
    // Apply radius filter
    console.log('Applied radius filter:', searchRadius);
  };

  const handleStateSelect = () => {
    // In a real app, this would open a state picker modal
    setSelectedState('Lagos');
  };

  const handleLGASelect = () => {
    // In a real app, this would open an LGA picker modal
    setSelectedLGA('Ikeja');
  };

  // Check if location selection is valid for apply button
  const isLocationSelectionValid = !useCurrentLocation && (selectedState && selectedLGA);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search by Location</Text>
        <TouchableOpacity onPress={handleReset}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Map Container */}
        <View style={styles.mapContainer}>
          <Image 
            source={require('../assets/location.png')} 
            style={styles.mapImage}
            resizeMode="cover"
          />
          {/* Map pins/markers could be overlaid here */}
          <View style={styles.mapPin1}>
            <View style={styles.pinContainer}>
              <Text style={styles.pinText}>RNIE2</Text>
            </View>
          </View>
          <View style={styles.mapPin2}>
            <View style={styles.pinContainer}>
              <Text style={styles.pinText}>RNIE2</Text>
            </View>
          </View>
        </View>

        {/* Current Location Toggle */}
        <View style={styles.locationToggle}>
          <View style={styles.locationIcon}>
            <Ionicons name="location" size={20} color={colors.primary} />
          </View>
          <Text style={styles.locationText}>Use my current location</Text>
          <TouchableOpacity 
            style={[styles.toggle, useCurrentLocation && styles.toggleActive]}
            onPress={() => setUseCurrentLocation(!useCurrentLocation)}
          >
            <View style={[styles.toggleThumb, useCurrentLocation && styles.toggleThumbActive]} />
          </TouchableOpacity>
        </View>

        {/* Choose LGA Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Your LGA</Text>
          
          {/* State Selector */}
          <TouchableOpacity style={styles.selector} onPress={() => setSelectedState('Lagos')}>
            <Text style={styles.selectorText}>{selectedState || 'State'}</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.gray} />
          </TouchableOpacity>
          
          {/* Local Government Selector */}
          <TouchableOpacity style={styles.selector} onPress={() => setSelectedLGA('Ikeja')}>
            <Text style={styles.selectorText}>{selectedLGA || 'Local Government'}</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.gray} />
          </TouchableOpacity>
          
          {/* Apply Button */}
          <Button
            title="Apply"
            variant={(!useCurrentLocation && selectedState && selectedLGA) ? "primary" : "outlineGray"}
            onPress={handleApplyLocation}
            style={styles.applyButton}
            disabled={useCurrentLocation || !selectedState || !selectedLGA}
          />
        </View>

        {/* Search Within Radius Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Search Within Radius</Text>
          
          {/* Radius Slider */}
          <View style={styles.radiusContainer}>
            <View style={styles.radiusSlider}>
              <View style={styles.sliderTrack} />
              <View style={[styles.sliderProgress, { width: `${(searchRadius / 10) * 100}%` }]} />
              <TouchableOpacity 
                style={[styles.sliderThumb, { left: `${(searchRadius / 10) * 100 - 2}%` }]}
                // You can add pan gesture handler here for dragging
              />
            </View>
            <Text style={styles.radiusText}>{searchRadius} Km</Text>
          </View>
          
          {/* Apply Button */}
          <Button
            title="Apply"
            variant={searchRadius > 0 ? "primary" : "outlineGray"}
            onPress={handleApplyRadius}
            style={styles.applyButton}
            disabled={searchRadius <= 0}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    textAlign: 'center',
    flex: 1,
  },
  resetText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  mapContainer: {
    height: 200,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapPin1: {
    position: 'absolute',
    top: 30,
    left: 30,
  },
  mapPin2: {
    position: 'absolute',
    top: 80,
    left: 100,
  },
  pinContainer: {
    backgroundColor: colors.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  pinText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  locationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  locationIcon: {
    marginRight: 12,
  },
  locationText: {
    flex: 1,
    fontSize: 16,
    color: colors.black,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    position: 'relative',
  },
  toggleActive: {
    backgroundColor: colors.primary,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    position: 'absolute',
    left: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    left: 22,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 16,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  selectorText: {
    fontSize: 16,
    color: colors.black,
  },
  applyButton: {
    marginTop: 20,
  },
  radiusContainer: {
    marginBottom: 12,
  },
  radiusSlider: {
    height: 6,
    position: 'relative',
    marginVertical: 20,
  },
  sliderTrack: {
    height: 6,
    backgroundColor: colors.lightGray,
    borderRadius: 3,
  },
  sliderProgress: {
    height: 6,
    backgroundColor: colors.primary,
    borderRadius: 3,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  sliderThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    position: 'absolute',
    top: -7,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  radiusText: {
    textAlign: 'right',
    fontSize: 14,
    color: colors.gray,
    fontWeight: '500',
  },
}); 