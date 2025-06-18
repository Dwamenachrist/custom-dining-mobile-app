import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type NotificationType = 'All' | 'Orders' | 'Performance' | 'Reminders';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timeAgo: string;
  icon: string;
}

const TABS: NotificationType[] = ['All', 'Orders', 'Performance', 'Reminders'];

const RESTAURANT_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'Orders',
    title: 'Order #1054 Confirmed',
    message: 'Your customer\'s meal order has been successfully placed',
    timeAgo: '1m ago',
    icon: 'checkmark-circle'
  },
  {
    id: '2',
    type: 'Performance',
    title: 'New Promotion Live',
    message: '"Buy 2, Get 1 free smoothie" is now active on your menu .',
    timeAgo: '10m ago',
    icon: 'gift'
  },
  {
    id: '3',
    type: 'Performance',
    title: 'Customer Feedback Received',
    message: 'Loved the grilled fish! 4.8 rating from a recent customers',
    timeAgo: '30m ago',
    icon: 'chatbubble'
  },
  {
    id: '4',
    type: 'Reminders',
    title: 'Reminder: Update Menu',
    message: 'Don\'t forget to update your weekend specials.',
    timeAgo: '2h ago',
    icon: 'time'
  },
  {
    id: '5',
    type: 'Performance',
    title: 'Daily Sales Report',
    message: 'Review todays performance, insights and key .',
    timeAgo: '2h ago',
    icon: 'trending-up'
  },
];

export default function RestaurantNotificationsScreen() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<NotificationType>('All');

  const filteredNotifications = selectedTab === 'All' 
    ? RESTAURANT_NOTIFICATIONS
    : RESTAURANT_NOTIFICATIONS.filter(n => n.type === selectedTab);

  return (
    <SafeAreaView className="flex-1 bg-gray-100" style={{ marginTop: 60 }}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-4 pb-6">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-black">Notifications</Text>
        <View className="w-6" />
      </View>

      {/* Tabs */}
      <View className="px-6 mb-6">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 20 }}
        >
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setSelectedTab(tab)}
              style={{
                borderWidth: 2,
                borderColor: selectedTab === tab ? '#10b981' : '#000',
                backgroundColor: selectedTab === tab ? '#10b981' : 'transparent',
                borderRadius: 25,
                paddingHorizontal: 16,
                paddingVertical: 8,
                marginRight: 12,
                minWidth: 80,
                alignItems: 'center'
              }}
            >
              <Text style={{
                fontSize: 14,
                fontWeight: '500',
                color: selectedTab === tab ? '#fff' : '#000'
              }}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Notifications List */}
      <ScrollView style={{ flex: 1, paddingHorizontal: 24 }} showsVerticalScrollIndicator={false}>
        {filteredNotifications.map((notification) => (
          <View 
            key={notification.id} 
            style={{
              backgroundColor: '#A7D2A5',
              borderRadius: 16,
              padding: 16,
              marginBottom: 16,
              flexDirection: 'row',
              alignItems: 'flex-start'
            }}
          >
            {/* Icon */}
            <View 
              style={{
                width: 48,
                height: 48,
                backgroundColor: '#7BC97A',
                borderRadius: 24,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
                flexShrink: 0
              }}
            >
              <Ionicons 
                name={notification.icon as any} 
                size={24} 
                color="#ffffff" 
              />
            </View>
            
            {/* Content */}
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#1f2937',
                  flex: 1,
                  paddingRight: 8
                }}>
                  {notification.title}
                </Text>
                <Text style={{
                  fontSize: 12,
                  color: '#6b7280'
                }}>
                  {notification.timeAgo}
                </Text>
              </View>
              <Text style={{
                fontSize: 14,
                color: '#374151',
                lineHeight: 20
              }}>
                {notification.message}
              </Text>
            </View>
          </View>
        ))}

        {filteredNotifications.length === 0 && (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-gray-500 text-base">No notifications</Text>
          </View>
        )}
        
        {/* Bottom padding */}
        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
} 