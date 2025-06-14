import React from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useRouter } from 'expo-router';

export default function SettingScreen() {
  const [mealAlerts, setMealAlerts] = React.useState(true);
  const [recommendations, setRecommendations] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);
  const router = useRouter();

  // Placeholder handlers
  const handleManageProfile = () => {};
  const handleMealPlan = () => {};
  const handleOrders = () => {};
  const handleChangePassword = () => {};
  const handleLanguageSelection = () => {};
  const handleVoiceInput = () => {};
  const handleFAQ = () => {};
  const handleHelp = () => {};
  const handleTerms = () => {
    router.push('/terms');
  };
  const handleDeleteAccount = () => {};
  const handleLogout = () => {};

  const handleToggle = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    setter((prev) => !prev);
  };

  return (
    <>
    {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Settings</Text>
      </View>
    <ScrollView contentContainerStyle={styles.container}>

      {/* Notifications Section */}
      <Text style={styles.sectionTitle}>Notifications</Text>
      <View style={styles.rowWithDesc}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Meal Alerts</Text>
          <Text style={styles.desc}>Receive health alerts about your meals</Text>
        </View>
        <Switch
          value={mealAlerts}
          onValueChange={() => handleToggle(setMealAlerts)}
          trackColor={{ false: colors.lightGray, true: colors.primary }}
          thumbColor={mealAlerts ? colors.primary : colors.gray}
        />
      </View>
      <View style={styles.rowWithDesc}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Recommendations</Text>
          <Text style={styles.desc}>Get personalized meal recommendations</Text>
        </View>
        <Switch
          value={recommendations}
          onValueChange={() => handleToggle(setRecommendations)}
          trackColor={{ false: colors.lightGray, true: colors.primary }}
          thumbColor={recommendations ? colors.primary : colors.gray}
        />
      </View>
      <View style={styles.sectionLine} />

      {/* Account Section */}
      <Text style={styles.sectionTitle}>Account</Text>
      <TouchableOpacity style={styles.row} onPress={handleManageProfile}>
        <Text style={styles.label}>Manage profile</Text>
        <Ionicons name="chevron-forward-outline" size={20} color={colors.gray} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.row} onPress={handleMealPlan}>
        <Text style={styles.label}>Meal plan</Text>
        <Ionicons name="chevron-forward-outline" size={20} color={colors.gray} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.row} onPress={handleOrders}>
        <Text style={styles.label}>Orders</Text>
        <Ionicons name="chevron-forward-outline" size={20} color={colors.gray} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.row} onPress={handleChangePassword}>
        <Text style={styles.label}>Change password</Text>
        <Ionicons name="chevron-forward-outline" size={20} color={colors.gray} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.row} onPress={handleLanguageSelection}>
        <Text style={styles.label}>Language selection</Text>
        <Ionicons name="chevron-forward-outline" size={20} color={colors.gray} />
      </TouchableOpacity>
      <View style={styles.sectionLine} />

      {/* Accessibility Section */}
      <Text style={styles.sectionTitle}>Accessibility</Text>
      <TouchableOpacity style={styles.row} onPress={handleVoiceInput}>
        <Text style={styles.label}>Voice input</Text>
        <Ionicons name="mic-outline" size={20} color={colors.gray} />
      </TouchableOpacity>
      <View style={styles.row}>
        <Text style={styles.label}>Dark mode</Text>
        <Switch
          value={darkMode}
          onValueChange={() => handleToggle(setDarkMode)}
          trackColor={{ false: colors.lightGray, true: colors.primary }}
          thumbColor={darkMode ? colors.primary : colors.gray}
        />
      </View>
      <View style={styles.sectionLine} />

      {/* Support Section */}
      <Text style={styles.sectionTitle}>Support</Text>
      <TouchableOpacity style={styles.row} onPress={handleFAQ}>
        <Text style={styles.label}>FAQ</Text>
        <Ionicons name="help-circle-outline" size={20} color={colors.gray} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.row} onPress={handleHelp}>
        <Text style={styles.label}>Help</Text>
        <Ionicons name="information-circle-outline" size={20} color={colors.gray} />
      </TouchableOpacity>
      <View style={styles.sectionLine} />

      {/* Privacy & Security Section */}
      <Text style={styles.sectionTitle}>Privacy & Security</Text>
      <TouchableOpacity style={styles.row} onPress={handleTerms}>
        <Text style={styles.label}>Terms & Conditions</Text>
        <Ionicons name="document-outline" size={20} color={colors.gray} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.row} onPress={handleDeleteAccount}>
        <Text style={[styles.label, styles.deleteText]}>Delete Account</Text>
        <Ionicons name="trash-outline" size={20} color={colors.error} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.row} onPress={handleLogout}>
        <Text style={styles.label}>Log out</Text>
        <Ionicons name="log-out-outline" size={20} color={colors.gray} />
      </TouchableOpacity>
    </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 48,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 18,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0,
  },
  rowWithDesc: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0,
  },
  label: {
    fontSize: 14,
    color: colors.darkGray,
  },
  desc: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 2,
  },
  deleteText: {
    color: colors.error,
  },
  sectionLine: {
    height: 1,
    backgroundColor: "#98a3af",
    marginVertical: 10,
    width: '100%',
  },
});
