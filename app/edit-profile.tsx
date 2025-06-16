import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Image, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

const profileImage = require('../assets/profile.png');
const HEALTH_GOALS = ['Weight Loss', 'Muscle Gain', 'Maintenance'];
const DIET_PREFS = [
  { key: 'vegan', label: 'Vegan' },
  { key: 'lowSugar', label: 'Low - Sugar' },
  { key: 'lowCarb', label: 'Low - Carb' },
];

export default function EditProfile() {
  const [profileName, setProfileName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [goal, setGoal] = useState('');
  const [dietPrefs, setDietPrefs] = useState<{ [key: string]: boolean }>({});
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const nameInputRef = useRef<TextInput>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const name = await AsyncStorage.getItem('profileName');
        if (name) setProfileName(name);
        const a = await AsyncStorage.getItem('age');
        if (a) setAge(a);
        const g = await AsyncStorage.getItem('gender');
        if (g) setGender(g);
        const goalVal = await AsyncStorage.getItem('goal');
        if (goalVal) setGoal(goalVal);
        const dietVal = await AsyncStorage.getItem('dietPrefs');
        if (dietVal) setDietPrefs(JSON.parse(dietVal));
      } catch (e) {}
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      await AsyncStorage.setItem('profileName', profileName);
      await AsyncStorage.setItem('age', age);
      await AsyncStorage.setItem('gender', gender);
      await AsyncStorage.setItem('goal', goal);
      await AsyncStorage.setItem('dietPrefs', JSON.stringify(dietPrefs));
      router.back();
    } catch (e) {}
  };

  const handleDietToggle = (key: string) => {
    setDietPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Customize Profile</Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.profileImageWrapper}>
        <Image source={profileImage} style={styles.profileImage} />
      </View>
      <View style={styles.nameRow}>
        <Text style={styles.profileName}>{profileName || 'Dina Adewale'}</Text>
        <TouchableOpacity onPress={() => nameInputRef.current?.focus()}>
          <MaterialIcons name="edit" size={20} color="#222" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>
      <View style={styles.form}>
        <TextInput
          ref={nameInputRef}
          style={styles.input}
          value={profileName}
          onChangeText={setProfileName}
          placeholder="Name"
        />
        <TextInput
          style={styles.input}
          value={age}
          onChangeText={setAge}
          placeholder="Age"
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          value={gender}
          onChangeText={setGender}
          placeholder="Gender"
        />
        <Text style={styles.sectionLabel}>Health Goal</Text>
        <TouchableOpacity style={styles.dropdown} onPress={() => setGoalModalVisible(true)}>
          <Text style={{ color: goal ? '#222' : '#888', fontSize: 16 }}>{goal || 'Select Goal'}</Text>
          <MaterialIcons name="arrow-drop-down" size={24} color="#888" style={{ position: 'absolute', right: 10, top: 8 }} />
        </TouchableOpacity>
        <Modal
          visible={goalModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setGoalModalVisible(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setGoalModalVisible(false)}>
            <View style={styles.modalContent}>
              {HEALTH_GOALS.map((g) => (
                <TouchableOpacity
                  key={g}
                  style={styles.modalOption}
                  onPress={() => {
                    setGoal(g);
                    setGoalModalVisible(false);
                  }}
                >
                  <Text style={{ fontSize: 16, color: '#222' }}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Modal>
        <Text style={styles.sectionLabel}>Dietary Preferences</Text>
        {DIET_PREFS.map((pref) => (
          <TouchableOpacity
            key={pref.key}
            style={styles.checkboxRow}
            onPress={() => handleDietToggle(pref.key)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, dietPrefs[pref.key] && styles.checkboxChecked]}>
              {dietPrefs[pref.key] && <MaterialIcons name="check" size={18} color="#3A7752" />}
            </View>
            <Text style={styles.checkboxLabel}>{pref.label}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F5F0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#F7F5F0',
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
  },
  form: {
    marginTop: 8,
    marginHorizontal: 24,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginTop: 18,
    marginBottom: 8,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    position: 'relative',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    minWidth: 220,
    elevation: 4,
  },
  modalOption: {
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#3A7752',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#E6F4EA',
    borderColor: '#3A7752',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#222',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#3A7752',
    borderRadius: 8,
    marginTop: 32,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
}); 