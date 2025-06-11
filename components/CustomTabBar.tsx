import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';

const TABS = [
  { name: 'Home', icon: 'home-outline', route: '/home' },
  { name: 'Search', icon: 'search-outline', route: '/search' },
  { name: 'Order', icon: 'add', route: '/order', center: true },
  { name: 'Plans', icon: 'calendar-outline', route: '/plans' },
  { name: 'Profile', icon: 'person-outline', route: '/profile' },
];

export default function CustomTabBar(props: any) {
  const router = useRouter();
  const segments: string[] = useSegments();
  const currentRoute = '/' + (segments[1] || 'home');

  return (
    <View style={styles.container}>
      {TABS.map(tab => (
        <TouchableOpacity
          key={tab.name}
          onPress={() => router.replace(tab.route as any)}
          style={[
            styles.tab,
            tab.center && styles.centerTab,
            currentRoute === tab.route && styles.activeTab,
          ]}
        >
          <Ionicons
            name={tab.icon as any}
            size={tab.center ? 32 : 24}
            color={tab.center ? colors.white : (currentRoute === tab.route ? colors.primary : colors.gray)}
          />
          {!tab.center && (
            <Text
              style={[
                styles.label,
                currentRoute === tab.route && styles.activeLabel,
              ]}
            >
              {tab.name}
            </Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 24,
    margin: 16,
    padding: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  centerTab: {
    backgroundColor: colors.primary,
    borderRadius: 32,
    width: 64,
    height: 64,
    marginTop: -24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  activeTab: {
    // Optionally add a highlight for the active tab
  },
  label: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 4,
  },
  activeLabel: {
    color: colors.primary,
    fontWeight: 'bold',
  },
}); 