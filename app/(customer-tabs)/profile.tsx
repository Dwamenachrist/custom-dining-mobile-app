import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Alert, RefreshControl } from 'react-native';
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
  const [refreshing, setRefreshing] = useState(false);
  const [mealHistory, setMealHistory] = useState<any[]>([]);

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

  const refreshProfileData = async () => {
        try {
      // Reload meal plan and dietary preferences
          const mealPlanData = await AsyncStorage.getItem('mealPlan');
          const dietaryData = await AsyncStorage.getItem('dietaryPreferences');
          
          if (mealPlanData) {
            const parsed = JSON.parse(mealPlanData);
            setMealPlan(parsed);
            setGoal(parsed.mealGoal || 'Not set');
        console.log('🔄 Refreshed meal plan data:', parsed);
          }
          
          if (dietaryData) {
            const parsed = JSON.parse(dietaryData);
            setDietaryPrefs(parsed);
        console.log('🔄 Refreshed dietary preferences:', parsed);
      }

      // If we have dietary preferences but no goal, use the health goal from dietary preferences
      if (!goal && dietaryData) {
        const parsed = JSON.parse(dietaryData);
        if (parsed.healthGoal) {
          const goalMapping: { [key: string]: string } = {
            'balanced_nutrition': 'Balanced nutrition',
            'manage_diabetes': 'Manage diabetes', 
            'weight_loss': 'Weight loss',
            'plant_based': 'Plant-based',
          };
          const displayGoal = goalMapping[parsed.healthGoal] || parsed.healthGoal;
          setGoal(displayGoal);
        }
      }

      // Check backend connection status
      const authToken = await AsyncStorage.getItem('auth_token');
      setBackendConnected(!!authToken);
    } catch (e) {
      console.error('Error refreshing profile data:', e);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshProfileData();
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchProfile = async () => {
        try {
          // Get user's name
          const firstName = await AsyncStorage.getItem('firstName');
          setProfileName(firstName || 'User');

          // Refresh profile data (meal plan and dietary preferences)
          await refreshProfileData();

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

  useEffect(() => {
    const fetchMealHistory = async () => {
      try {
        const mealHistoryData = await AsyncStorage.getItem('mealHistory');
        if (mealHistoryData) {
          setMealHistory(JSON.parse(mealHistoryData));
        } else {
          setMealHistory([]);
        }
      } catch (e) {
        setMealHistory([]);
      }
    };
    fetchMealHistory();
  }, []);

  const showMealPlanDetails = () => {
    if (!mealPlan && !dietaryPrefs) {
      Alert.alert('No Meal Plan', 'You haven\'t created a meal plan yet. Would you like to create one?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Create Plan', onPress: () => router.push('/meal-plan-builder') }
      ]);
      return;
    }

    let details = '';
    
    if (mealPlan) {
      details += `🎯 Goal: ${mealPlan.mealGoal || 'Not set'}\n`;
      details += `📅 Duration: ${mealPlan.planDuration || 'Not set'}\n`;
      details += `🚫 Restrictions: ${mealPlan.restrictions?.join(', ') || 'None'}\n`;
      details += `❌ Dislikes: ${mealPlan.disliked || 'None'}\n`;
      if (mealPlan.meals && mealPlan.meals.length > 0) {
        details += `🍽️ Meals: ${mealPlan.meals.map((m: any) => m.type).join(', ')}\n`;
      }
    } else if (dietaryPrefs) {
      // Convert backend format to display format
      const goalMapping: { [key: string]: string } = {
        'balanced_nutrition': 'Balanced nutrition',
        'manage_diabetes': 'Manage diabetes', 
        'weight_loss': 'Weight loss',
        'plant_based': 'Plant-based',
      };
      const displayGoal = goalMapping[dietaryPrefs.healthGoal] || dietaryPrefs.healthGoal || 'Not set';
      
      details += `🎯 Goal: ${displayGoal}\n`;
      details += `🚫 Restrictions: ${dietaryPrefs.dietaryRestrictions?.join(', ') || 'None'}\n`;
      if (dietaryPrefs.preferredMealTags && dietaryPrefs.preferredMealTags.length > 0) {
        details += `🏷️ Preferred Tags: ${dietaryPrefs.preferredMealTags.join(', ')}\n`;
      }
    }

    details += `\nBackend Status: ${backendConnected ? '✅ Connected' : '📱 Local only'}`;

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
          icon={<MaterialCommunityIcons name="credit-card-outline" size={28} color="#3A7752" />}
          label="Payment"
          onPress={() => { }}
        />
        <ActionButton
          icon={<Entypo name="location" size={28} color="#3A7752" />}
          label="Addresses"
          onPress={() => { }}
        />
        <ActionButton
          icon={<MaterialCommunityIcons name="gift-outline" size={28} color="#3A7752" />}
          label="Referrals"
          onPress={showMealPlanDetails}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl onRefresh={onRefresh} refreshing={refreshing} />}>
        {/* Health Goal & Dietary Preference */}
        <TouchableOpacity style={styles.infoCard} onPress={showMealPlanDetails}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Health Goal</Text>
              <Text style={styles.infoValue}>{goal || 'Not set'}</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <MaterialIcons name="chevron-right" size={24} color="#3A7752" />
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.infoCard} onPress={showMealPlanDetails}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Dietary Preferences</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
                {(() => {
                  // Get restrictions from meal plan data first, then fallback to dietary preferences
                  let restrictions: string[] = [];
                  
                  if (mealPlan?.restrictions && mealPlan.restrictions.length > 0) {
                    restrictions = mealPlan.restrictions;
                  } else if (dietaryPrefs?.dietaryRestrictions && dietaryPrefs.dietaryRestrictions.length > 0) {
                    restrictions = dietaryPrefs.dietaryRestrictions;
                  }
                  
                  if (restrictions.length > 0) {
                    return (
                      <>
                        {restrictions.slice(0, 3).map((pref) => (
                    <View key={pref} style={styles.dietTag}>
                      <Text style={styles.dietTagText}>{pref}</Text>
                    </View>
                        ))}
                        {restrictions.length > 3 && (
                  <Text style={[styles.dietTagText, { color: '#888' }]}>
                            +{restrictions.length - 3} more
                  </Text>
                )}
                      </>
                    );
                  } else {
                    return <Text style={styles.infoValue}>None set</Text>;
                  }
                })()}
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#3A7752" />
          </View>
        </TouchableOpacity>

        {/* Dining Summary */}
        <TouchableOpacity onPress={() => router.push('/meal-history' as any)}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeader}>Recent Orders</Text>
            <Entypo name="chevron-right" size={22} color="#222" />
        </View>
        </TouchableOpacity>
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
  const router = require('expo-router').useRouter();
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
      <TouchableOpacity style={styles.orderButton} onPress={() => router.push({ pathname: '/meal/[id]', params: { id: title } })}>
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
    justifyContent: 'center',
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