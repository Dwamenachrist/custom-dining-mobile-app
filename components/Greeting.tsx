import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface GreetingHeaderProps {
  name: string;
  image?: string | null;
}

// Function to get time-based greeting
const getTimeBasedGreeting = (): string => {
  const hour = new Date().getHours();
  
  if (hour < 12) {
    return 'Good morning';
  } else if (hour < 17) {
    return 'Good afternoon';
  } else {
    return 'Good evening';
  }
};

export default function GreetingHeader({ name, image }: GreetingHeaderProps) {
  const router = useRouter();
  const greeting = getTimeBasedGreeting();

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>{greeting}, {name}</Text>
      <View style={styles.rightSection}>
        <TouchableOpacity onPress={() => router.push('/customer-notifications')}>
          <Ionicons 
            name="notifications-outline"
            size={34}
            color="#1a1a1a"
          />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => router.push('/(customer-tabs)/profile' as any)}
          style={styles.avatarContainer}
        >
          {image ? (
            <Image 
              source={{ uri: image }} 
              style={styles.avatar}
              onError={() => console.log('Error loading profile image')}
            />
          ) : (
            <Image source={require('../assets/profile.png')} style={styles.avatar} /> 
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 16,
    marginRight: 16,
    paddingVertical: 8,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  notificationIcon: {
    width: 34,
    height: 34,
  },
  avatarContainer: {
    borderRadius: 25,
    padding: 2,
    backgroundColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
});