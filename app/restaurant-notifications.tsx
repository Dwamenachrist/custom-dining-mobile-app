import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, StatusBar, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNotifications } from '../notification-context';
import { NotificationData } from '../services/notificationService';

type NotificationType = 'All' | 'order' | 'promotion' | 'reminder' | 'meal_plan' | 'system';

const TABS: NotificationType[] = ['All', 'order', 'promotion', 'reminder', 'meal_plan', 'system'];

export default function RestaurantNotificationsScreen() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<NotificationType>('All');
  const [refreshing, setRefreshing] = useState(false);
  
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    deleteNotification, 
    markAllAsRead, 
    clearAllNotifications,
    refreshNotifications,
    sendSampleNotifications 
  } = useNotifications();

  // Filter notifications based on selected tab
  const filteredNotifications = selectedTab === 'All' 
    ? notifications
    : notifications.filter(n => n.type === selectedTab);

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await refreshNotifications();
    setRefreshing(false);
  };

  // Handle notification tap
  const handleNotificationTap = async (notification: NotificationData) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    // Handle navigation if action is present
    if (notification.action?.type === 'navigate') {
      const { screen, ...params } = notification.action.data;
      router.push(screen as any);
    }
  };

  // Handle delete notification
  const handleDeleteNotification = async (notificationId: string) => {
    await deleteNotification(notificationId);
  };

  // Get icon name based on notification type
  const getIconName = (type: string): string => {
    switch (type) {
      case 'order':
        return 'checkmark-circle';
      case 'promotion':
        return 'gift';
      case 'reminder':
        return 'time';
      case 'meal_plan':
        return 'restaurant';
      case 'system':
        return 'notifications';
      default:
        return 'information-circle';
    }
  };

  // Format timestamp
  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100" style={{ marginTop: 60 }}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-4 pb-6">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-black">Notifications</Text>
        <View className="flex-row items-center gap-4">
          <TouchableOpacity onPress={markAllAsRead}>
            <Ionicons name="checkmark-done" size={24} color="#10b981" />
          </TouchableOpacity>
          <TouchableOpacity onPress={clearAllNotifications}>
            <Ionicons name="trash" size={24} color="#ef4444" />
          </TouchableOpacity>
        </View>
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
      <ScrollView 
        style={{ flex: 1, paddingHorizontal: 24 }} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-gray-500 text-base">Loading notifications...</Text>
          </View>
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <TouchableOpacity
            key={notification.id} 
              onPress={() => handleNotificationTap(notification)}
            style={{
                backgroundColor: notification.read ? '#f8f9fa' : '#A7D2A5',
              borderRadius: 16,
              padding: 16,
              marginBottom: 16,
              flexDirection: 'row',
                alignItems: 'flex-start',
                borderLeftWidth: 4,
                borderLeftColor: notification.read ? '#e9ecef' : '#7BC97A',
            }}
          >
            {/* Icon */}
            <View 
              style={{
                width: 48,
                height: 48,
                  backgroundColor: notification.read ? '#e9ecef' : '#7BC97A',
                borderRadius: 24,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
                flexShrink: 0
              }}
            >
              <Ionicons 
                  name={getIconName(notification.type) as any} 
                size={24} 
                  color={notification.read ? '#6c757d' : '#ffffff'} 
              />
            </View>
            
            {/* Content */}
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <Text style={{
                  fontSize: 16,
                    fontWeight: notification.read ? '500' : '600',
                    color: notification.read ? '#6c757d' : '#1f2937',
                  flex: 1,
                  paddingRight: 8
                }}>
                  {notification.title}
                </Text>
                <Text style={{
                  fontSize: 12,
                    color: notification.read ? '#adb5bd' : '#6b7280'
                }}>
                    {formatTimeAgo(notification.timestamp)}
                </Text>
              </View>
              <Text style={{
                fontSize: 14,
                  color: notification.read ? '#adb5bd' : '#374151',
                lineHeight: 20
              }}>
                {notification.message}
              </Text>
            </View>

              {/* Delete Button */}
              <TouchableOpacity 
                onPress={() => handleDeleteNotification(notification.id)}
                style={{ padding: 4, marginLeft: 8 }}
              >
                <Ionicons name="close" size={18} color="#6b7280" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        ) : (
          <View className="flex-1 items-center justify-center py-20">
            <Ionicons name="notifications-off" size={64} color="#d1d5db" style={{ marginBottom: 16 }} />
            <Text className="text-gray-500 text-base mb-4">No notifications</Text>
            <TouchableOpacity 
              onPress={sendSampleNotifications}
              style={{
                backgroundColor: '#10b981',
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 8
              }}
            >
              <Text style={{ color: '#ffffff', fontWeight: '600' }}>
                Send Sample Notifications
              </Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Bottom padding */}
        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
} 