import React, { useState, useCallback } from 'react';

import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import Entypo from '@expo/vector-icons/Entypo';

import { router, useFocusEffect } from 'expo-router';

import AsyncStorage from '@react-native-async-storage/async-storage';



const profileImage = require('../../assets/profile.png');

const DIET_PREFS = [

  { key: 'vegan', label: 'Vegan' },

  { key: 'lowSugar', label: 'Low - Sugar' },

  { key: 'lowCarb', label: 'Low - Carb' },

];



export default function Profile() {

  const [profileName, setProfileName] = useState('');

  const [goal, setGoal] = useState('');

  const [dietPrefs, setDietPrefs] = useState<{ [key: string]: boolean }>({});

  const [profileImageUri, setProfileImageUri] = useState('');



  useFocusEffect(

    useCallback(() => {

      const fetchProfile = async () => {

        try {

          // Get user's first name from login

          const firstName = await AsyncStorage.getItem('firstName');

          const name = await AsyncStorage.getItem('profileName');

          setProfileName(name || firstName || 'Dina Adewale');

          const goalVal = await AsyncStorage.getItem('goal');

          if (goalVal) setGoal(goalVal);

          const dietVal = await AsyncStorage.getItem('dietPrefs');

          if (dietVal) setDietPrefs(JSON.parse(dietVal));

          const imageUri = await AsyncStorage.getItem('profileImage');

          if (imageUri) setProfileImageUri(imageUri);

        } catch (e) {

          console.error('Error fetching profile:', e);

        }

      };

      fetchProfile();

    }, [])

  );



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

          onPress={() => { }}

        />

      </View>



      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Health Goal & Dietary Preference */}

        <View style={styles.infoCard}>

          <Text style={styles.infoLabel}>Health Goal</Text>

          <Text style={styles.infoValue}>{goal || 'Not set'}</Text>

        </View>

        <View style={styles.infoCard}>

          <Text style={styles.infoLabel}>Dietary Preferences</Text>

          <View>

            {Object.keys(dietPrefs).filter(key => dietPrefs[key]).length === 0 ? (

              <Text style={styles.infoValue}>None</Text>

            ) : (

              DIET_PREFS.filter(pref => dietPrefs[pref.key]).map(pref => (

                <Text key={pref.key} style={styles.infoValue}>{pref.label}</Text>

              ))

            )}

          </View>

        </View>



        {/* Dining Summary */}

        <View style={styles.sectionHeaderRow}>

          <Text style={styles.sectionHeader}>Dining Summary</Text>

          <Entypo name="chevron-down" size={22} color="#222" />

        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>

          <MealCard

            date="May 27"

            title="Tofu Bowl"

            subtitle="from Green chef, Lagos"

            tags={["Low-Carb", "Sugar-free"]}

          />

          <MealCard

            date="May 25"

            title="Pepper Soup"

            subtitle="from Naija Kitchen"

            tags={["Diabetic-friendly"]}

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