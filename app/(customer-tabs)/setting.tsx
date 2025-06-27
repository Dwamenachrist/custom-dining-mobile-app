import React from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useRouter } from 'expo-router';
import AuthService from '../../services/authService';
import { useAuth } from '../../auth-context';
import { ComingSoonToast } from '../../components/ComingSoonToast';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingScreen() {
  const [mealAlerts, setMealAlerts] = React.useState(true);
  const [recommendations, setRecommendations] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);
  const [showComingSoonToast, setShowComingSoonToast] = React.useState(false);
  const [comingSoonFeature, setComingSoonFeature] = React.useState('');
  const router = useRouter();
  const { setIsLoggedIn } = useAuth();

  // Helper function to show coming soon toast
  const showComingSoon = (featureName: string) => {
    setComingSoonFeature(featureName);
    setShowComingSoonToast(true);
  };

  // Implemented handlers
  const handleManageProfile = () => {
    router.push('/edit-profile');
  };
  const handleMealPlan = () => {
    router.push('/meal-plan-builder');
  };
  const handleChangePassword = () => {
    router.push('/change-password');
  };
  const handleTerms = () => {
    router.push('/customer-terms');
  };

  // Coming soon handlers
  const handleOrders = () => showComingSoon('Order History');
  const handleLanguageSelection = () => showComingSoon('Language Selection');
  const handleVoiceInput = () => showComingSoon('Voice Input');
  const handleHelp = () => showComingSoon('Customer Support');

  // Toggle handlers with coming soon for actual functionality
  const handleMealAlertsToggle = () => {
    setMealAlerts(!mealAlerts);
    showComingSoon('Smart Meal Alerts');
  };

  const handleRecommendationsToggle = () => {
    setRecommendations(!recommendations);
    showComingSoon('AI Recommendations');
  };

  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
    showComingSoon('Dark Mode Theme');
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all local user data
              await AsyncStorage.clear();
              setIsLoggedIn(false);
              router.replace('/(auth)/customer-login');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete account.');
            }
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AuthService.logout();
              setIsLoggedIn(false);
              router.replace('/(auth)/customer-login');
            } catch (error) {
              Alert.alert('Error', 'Failed to log out.');
            }
          },
        },
      ]
    );
  };

  return (
    <>
      {/* Coming Soon Toast */}
      <ComingSoonToast
        visible={showComingSoonToast}
        feature={comingSoonFeature}
        onClose={() => setShowComingSoonToast(false)}
      />

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
            onValueChange={handleMealAlertsToggle}
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
            onValueChange={handleRecommendationsToggle}
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
            onValueChange={handleDarkModeToggle}
            trackColor={{ false: colors.lightGray, true: colors.primary }}
            thumbColor={darkMode ? colors.primary : colors.gray}
          />
        </View>
        <View style={styles.sectionLine} />

        {/* Support Section */}
        <Text style={styles.sectionTitle}>Support</Text>
        <TouchableOpacity style={styles.row} onPress={() => router.push('/faq-chatbot' as any)}>
          <Text style={styles.label}>FAQ & Chatbot</Text>
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