import React, { useState, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Entypo from '@expo/vector-icons/Entypo';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DietaryPreferences, getUserMeals } from '../../services/api';

const profileImage = require('../../assets/profile.png');

const DIET_PREFS = [
  { key: 'vegan', label: 'Vegan' },
  { key: 'lowSugar', label: 'Low - Sugar' },
  { key: 'lowCarb', label: 'Low - Carb' },
];

export default function Profile() {
  const [profileName, setProfileName] = useState('');
  const [goal, setGoal] = useState('');
  const [dietaryPrefs, setDietaryPrefs] = useState<DietaryPreferences | null>(null);
  const [mealPlan, setMealPlan] = useState<any>(null);
  const [profileImageUri, setProfileImageUri] = useState('');
  const [backendConnected, setBackendConnected] = useState(false);

  const loadPersonalizedMeals = async () => {
    try {
      const response = await getUserMeals();
      if (response.success && response.data) {
        console.log('✅ Loaded personalized meals:', response.data);
        Alert.alert('Personalized Meals', `Found ${response.data.length} meals matching your preferences!`);
      } else {
        Alert.alert('Info', 'Using local meal preferences. Connect to backend for personalized meals.');
      }
    } catch (error) {
      console.log('📱 Using local data - backend not available');
    }
  };

  useFocusEffect(
    useCallback(() => {
      const fetchProfile = async () => {
        try {
          // Get user's name
          const firstName = await AsyncStorage.getItem('firstName');
          const lastName = await AsyncStorage.getItem('lastName');
          const userName = await AsyncStorage.getItem('userName');
          const name = await AsyncStorage.getItem('profileName');
          setProfileName(name || userName || `${firstName || ''} ${lastName || ''}`.trim() || 'User');

          // Load meal plan and dietary preferences from meal plan builder
          const mealPlanData = await AsyncStorage.getItem('mealPlan');
          const dietaryData = await AsyncStorage.getItem('dietaryPreferences');
          
          if (mealPlanData) {
            const parsed = JSON.parse(mealPlanData);
            setMealPlan(parsed);
            setGoal(parsed.mealGoal || 'Not set');
          }
          
          if (dietaryData) {
            const parsed = JSON.parse(dietaryData);
            setDietaryPrefs(parsed);
          }

          // Fallback to old format for backward compatibility
          if (!goal) {
            const goalVal = await AsyncStorage.getItem('goal');
            if (goalVal) setGoal(goalVal);
          }

          const imageUri = await AsyncStorage.getItem('profileImage');
          if (imageUri) setProfileImageUri(imageUri);

          // Check if we have auth token (backend connected)
          const authToken = await AsyncStorage.getItem('auth_token');
          setBackendConnected(!!authToken);

        } catch (e) {
          console.error('Error fetching profile:', e);
        }
      };
      fetchProfile();
    }, [])
  );

  const showMealPlanDetails = () => {
    if (!mealPlan) {
      Alert.alert('No Meal Plan', 'You haven\'t created a meal plan yet. Would you like to create one?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Create Plan', onPress: () => router.push('/meal-plan-builder') }
      ]);
      return;
    }

    const details = `
🎯 Goal: ${mealPlan.mealGoal}
📅 Duration: ${mealPlan.planDuration}
🚫 Restrictions: ${mealPlan.restrictions.join(', ') || 'None'}
❌ Dislikes: ${mealPlan.disliked || 'None'}
🍽️ Meals: ${mealPlan.meals.map((m: any) => m.type).join(', ')}

Backend Status: ${backendConnected ? '✅ Connected' : '📱 Local only'}
    `;

    Alert.alert('Your Meal Plan', details, [
      { text: 'OK' },
      { text: 'Edit Plan', onPress: () => router.push('/meal-plan-builder') },
      ...(backendConnected ? [{ text: 'Load Personalized Meals', onPress: loadPersonalizedMeals }] : [])
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 24 }} />
        <Text style={styles.headerTitle}>Profile</Text>
        <MaterialIcons name="person-outline" size={24} color="#222" />
      </View>

      {/* Profile Image */}
      <View style={styles.profileImageWrapper}>
        {profileImageUri ? (
          <Image source={{ uri: profileImageUri }} style={styles.profileImage} />
        ) : (
          <Image source={profileImage} style={styles.profileImage} />
        )}
      </View>
      <Text style={styles.profileName}>{profileName}</Text>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <ActionButton
          icon={<MaterialCommunityIcons name="account-edit-outline" size={28} color="#3A7752" />}
          label="Edit Profile"
          onPress={() => router.push('/edit-profile')}
        />
        <ActionButton
          icon={<MaterialCommunityIcons name="food-apple-outline" size={28} color="#3A7752" />}
          label="Meal Plan"
          onPress={showMealPlanDetails}
        />
        <ActionButton
          icon={<MaterialCommunityIcons name="credit-card-outline" size={28} color="#3A7752" />}
          label="Payment"
          onPress={() => { }}
        />
        <ActionButton
          icon={<Entypo name="location" size={28} color="#3A7752" />}
          label="Addresses"
          onPress={() => { }}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Health Goal & Dietary Preference */}
        <TouchableOpacity style={styles.infoCard} onPress={showMealPlanDetails}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Health Goal</Text>
              <Text style={styles.infoValue}>{goal || 'Not set'}</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 12, color: backendConnected ? '#4CAF50' : '#FF9800', fontWeight: 'bold' }}>
                {backendConnected ? '🌐 Synced' : '📱 Local'}
              </Text>
              <MaterialIcons name="chevron-right" size={24} color="#3A7752" />
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.infoCard} onPress={showMealPlanDetails}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Dietary Preferences</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
                {dietaryPrefs?.dietaryRestrictions && dietaryPrefs.dietaryRestrictions.length > 0 ? (
                  dietaryPrefs.dietaryRestrictions.slice(0, 3).map((pref) => (
                    <View key={pref} style={styles.dietTag}>
                      <Text style={styles.dietTagText}>{pref}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.infoValue}>None set</Text>
                )}
                {dietaryPrefs?.dietaryRestrictions && dietaryPrefs.dietaryRestrictions.length > 3 && (
                  <Text style={[styles.dietTagText, { color: '#888' }]}>
                    +{dietaryPrefs.dietaryRestrictions.length - 3} more
                  </Text>
                )}
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#3A7752" />
          </View>
        </TouchableOpacity>

        {/* Backend Integration Status */}
        {backendConnected && (
          <TouchableOpacity style={[styles.infoCard, { backgroundColor: '#E8F5E8' }]} onPress={loadPersonalizedMeals}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Personalized Meals</Text>
                <Text style={styles.infoValue}>Tap to load from backend</Text>
              </View>
              <MaterialCommunityIcons name="cloud-download-outline" size={24} color="#3A7752" />
            </View>
          </TouchableOpacity>
        )}

        {/* Dining Summary */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeader}>Recent Orders</Text>
          <Entypo name="chevron-down" size={22} color="#222" />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
          <MealCard
            date="Today"
            title="Tofu Bowl"
            subtitle="from Green chef, Lagos"
            tags={dietaryPrefs?.preferredMealTags?.slice(0, 2) || ["Healthy"]}
          />
          <MealCard
            date="Yesterday"
            title="Quinoa Salad"
            subtitle="from Healthy Bites"
            tags={["Low-Carb", "Vegan"]}
          />
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

function ActionButton({ icon, label, onPress }: { icon: React.ReactNode; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={{ alignItems: 'center', flex: 1 }} onPress={onPress}>
      <View style={styles.actionIconBox}>{icon}</View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function MealCard({ date, title, subtitle, tags }: { date: string; title: string; subtitle: string; tags: string[] }) {
  return (
    <View style={styles.mealCard}>
      <Text style={styles.mealDate}>{date}</Text>
      <Text style={styles.mealTitle}>{title}</Text>
      <Text style={styles.mealSubtitle}>{subtitle}</Text>
      <View style={styles.mealTagsRow}>
        {tags.map((tag) => (
          <View key={tag} style={styles.mealTag}>
            <Text style={styles.mealTagText}>{tag}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity style={styles.orderButton}>
        <Text style={styles.orderButtonText}>Order</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: -30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
  },
  profileImageWrapper: {
    alignSelf: 'center',
    marginTop: 16,
    borderWidth: 4,
    borderColor: '#3A7752',
    borderRadius: 100,
    padding: 4,
    backgroundColor: '#fff',
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  profileName: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
    marginTop: 12,
    marginBottom: 18,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 18,
    marginTop: 4,
  },
  actionIconBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: 77.5,
    height: 77.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 1,
  },
  actionLabel: {
    color: '#3A7752',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    elevation: 1,
  },
  infoLabel: {
    color: '#888',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
  },
  infoValue: {
    color: '#222',
    fontSize: 16,
    fontWeight: '700',
  },
  dietTag: {
    backgroundColor: '#E6F4EA',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
    marginBottom: 4,
  },
  dietTagText: {
    color: '#3A7752',
    fontSize: 13,
    fontWeight: '500',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 18,
    marginBottom: 4,
  },
  sectionHeader: {
    fontSize: 17,
    fontWeight: '700',
    color: '#222',
    flex: 1,
  },
  mealCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 14,
    width: 200,
    elevation: 2,
  },
  mealDate: {
    color: '#888',
    fontSize: 13,
    marginBottom: 2,
  },
  mealTitle: {
    color: '#222',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  mealSubtitle: {
    color: '#888',
    fontSize: 13,
    marginBottom: 8,
  },
  mealTagsRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  mealTag: {
    backgroundColor: '#E6F4EA',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 6,
  },
  mealTagText: {
    color: '#3A7752',
    fontSize: 12,
    fontWeight: '500',
  },
  orderButton: {
    borderWidth: 1,
    borderColor: '#3A7752',
    borderRadius: 8,
    paddingVertical: 4,
    alignItems: 'center',
  },
  orderButtonText: {
    color: '#3A7752',
    fontWeight: '600',
    fontSize: 15,
  },
});