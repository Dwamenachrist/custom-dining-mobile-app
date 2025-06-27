import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationData {
  id: string;
  type: 'order' | 'promotion' | 'reminder' | 'meal_plan' | 'system';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  action?: {
    type: 'navigate' | 'open_url' | 'custom';
    data: any;
  };
  metadata?: {
    orderId?: string;
    restaurantId?: string;
    mealId?: string;
    [key: string]: any;
  };
}

export interface NotificationPreferences {
  orderNotifications: boolean;
  promotionNotifications: boolean;
  reminderNotifications: boolean;
  mealPlanNotifications: boolean;
  systemNotifications: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

class NotificationService {
  private static instance: NotificationService;
  private notificationListener: Notifications.Subscription | null = null;
  private responseListener: Notifications.Subscription | null = null;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Initialize notification service
  async initialize(): Promise<void> {
    try {
      console.log('🔔 Initializing notification service...');
      
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('❌ Notification permissions not granted');
        return;
      }

      // Get push token
      const token = await this.getPushToken();
      console.log('✅ Push token:', token);

      // Set up notification listeners
      this.setupNotificationListeners();

      console.log('✅ Notification service initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing notification service:', error);
    }
  }

  // Get push token for device
  async getPushToken(): Promise<string | null> {
    try {
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: 'c182f76b-528e-4133-b8cf-6b5ea4fa0e36', // Your actual Expo project ID
      });
      
      // Store token locally
      await AsyncStorage.setItem('pushToken', token.data);
      return token.data;
    } catch (error) {
      console.error('❌ Error getting push token:', error);
      return null;
    }
  }

  // Set up notification listeners
  private setupNotificationListeners(): void {
    // Listen for incoming notifications
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('📱 Notification received:', notification);
      this.handleIncomingNotification(notification);
    });

    // Listen for notification responses (when user taps notification)
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification response:', response);
      this.handleNotificationResponse(response);
    });
  }

  // Handle incoming notification
  private async handleIncomingNotification(notification: Notifications.Notification): Promise<void> {
    try {
      const data = notification.request.content.data as any;
      const notificationData: NotificationData = {
        id: notification.request.identifier,
        type: (data?.type as NotificationData['type']) || 'system',
        title: notification.request.content.title || '',
        message: notification.request.content.body || '',
        timestamp: Date.now(),
        read: false,
        action: data?.action as NotificationData['action'],
        metadata: data?.metadata as NotificationData['metadata'],
      };

      // Save to local storage
      await this.saveNotification(notificationData);
      
      // Update badge count
      await this.updateBadgeCount();
    } catch (error) {
      console.error('❌ Error handling incoming notification:', error);
    }
  }

  // Handle notification response (user tap)
  private async handleNotificationResponse(response: Notifications.NotificationResponse): Promise<void> {
    try {
      const notificationId = response.notification.request.identifier;
      
      // Mark as read
      await this.markNotificationAsRead(notificationId);
      
      // Handle action if present
      const data = response.notification.request.content.data as any;
      const action = data?.action;
      if (action) {
        await this.executeNotificationAction(action);
      }
    } catch (error) {
      console.error('❌ Error handling notification response:', error);
    }
  }

  // Send local notification
  async sendLocalNotification(notification: Omit<NotificationData, 'id' | 'timestamp' | 'read'>): Promise<string> {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.message,
          data: {
            type: notification.type,
            action: notification.action,
            metadata: notification.metadata,
          },
          sound: true,
          badge: 1,
        },
        trigger: null, // Send immediately
      });

      // Save to local storage
      const notificationData: NotificationData = {
        ...notification,
        id,
        timestamp: Date.now(),
        read: false,
      };
      await this.saveNotification(notificationData);

      return id;
    } catch (error) {
      console.error('❌ Error sending local notification:', error);
      throw error;
    }
  }

  // Schedule notification for later
  async scheduleNotification(
    notification: Omit<NotificationData, 'id' | 'timestamp' | 'read'>,
    trigger: Notifications.NotificationTriggerInput
  ): Promise<string> {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.message,
          data: {
            type: notification.type,
            action: notification.action,
            metadata: notification.metadata,
          },
          sound: true,
          badge: 1,
        },
        trigger,
      });

      return id;
    } catch (error) {
      console.error('❌ Error scheduling notification:', error);
      throw error;
    }
  }

  // Save notification to local storage
  private async saveNotification(notification: NotificationData): Promise<void> {
    try {
      const existingNotifications = await this.getNotifications();
      const updatedNotifications = [notification, ...existingNotifications];
      
      // Keep only last 100 notifications
      const trimmedNotifications = updatedNotifications.slice(0, 100);
      
      await AsyncStorage.setItem('notifications', JSON.stringify(trimmedNotifications));
    } catch (error) {
      console.error('❌ Error saving notification:', error);
    }
  }

  // Get all notifications
  async getNotifications(): Promise<NotificationData[]> {
    try {
      const notificationsJson = await AsyncStorage.getItem('notifications');
      return notificationsJson ? JSON.parse(notificationsJson) : [];
    } catch (error) {
      console.error('❌ Error getting notifications:', error);
      return [];
    }
  }

  // Get unread notifications
  async getUnreadNotifications(): Promise<NotificationData[]> {
    const notifications = await this.getNotifications();
    return notifications.filter(n => !n.read);
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const notifications = await this.getNotifications();
      const updatedNotifications = notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      );
      
      await AsyncStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      await this.updateBadgeCount();
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
    }
  }

  // Mark all notifications as read
  async markAllNotificationsAsRead(): Promise<void> {
    try {
      const notifications = await this.getNotifications();
      const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
      
      await AsyncStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      await this.updateBadgeCount();
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
    }
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const notifications = await this.getNotifications();
      const updatedNotifications = notifications.filter(n => n.id !== notificationId);
      
      await AsyncStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      await this.updateBadgeCount();
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
    }
  }

  // Clear all notifications
  async clearAllNotifications(): Promise<void> {
    try {
      await AsyncStorage.removeItem('notifications');
      await Notifications.dismissAllNotificationsAsync();
      await this.updateBadgeCount();
    } catch (error) {
      console.error('❌ Error clearing all notifications:', error);
    }
  }

  // Update badge count
  async updateBadgeCount(): Promise<void> {
    try {
      const unreadCount = (await this.getUnreadNotifications()).length;
      await Notifications.setBadgeCountAsync(unreadCount);
    } catch (error) {
      console.error('❌ Error updating badge count:', error);
    }
  }

  // Get notification preferences
  async getNotificationPreferences(): Promise<NotificationPreferences> {
    try {
      const preferencesJson = await AsyncStorage.getItem('notificationPreferences');
      return preferencesJson ? JSON.parse(preferencesJson) : {
        orderNotifications: true,
        promotionNotifications: true,
        reminderNotifications: true,
        mealPlanNotifications: true,
        systemNotifications: true,
        soundEnabled: true,
        vibrationEnabled: true,
      };
    } catch (error) {
      console.error('❌ Error getting notification preferences:', error);
      return {
        orderNotifications: true,
        promotionNotifications: true,
        reminderNotifications: true,
        mealPlanNotifications: true,
        systemNotifications: true,
        soundEnabled: true,
        vibrationEnabled: true,
      };
    }
  }

  // Save notification preferences
  async saveNotificationPreferences(preferences: NotificationPreferences): Promise<void> {
    try {
      await AsyncStorage.setItem('notificationPreferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('❌ Error saving notification preferences:', error);
    }
  }

  // Execute notification action
  private async executeNotificationAction(action: any): Promise<void> {
    try {
      switch (action.type) {
        case 'navigate':
          // Handle navigation action
          console.log('🧭 Navigation action:', action.data);
          break;
        case 'open_url':
          // Handle URL opening action
          console.log('🔗 URL action:', action.data);
          break;
        case 'custom':
          // Handle custom action
          console.log('⚙️ Custom action:', action.data);
          break;
        default:
          console.log('❓ Unknown action type:', action.type);
      }
    } catch (error) {
      console.error('❌ Error executing notification action:', error);
    }
  }

  // Clean up listeners
  cleanup(): void {
    if (this.notificationListener) {
      this.notificationListener.remove();
    }
    if (this.responseListener) {
      this.responseListener.remove();
    }
  }

  // Send sample notifications for testing
  async sendSampleNotifications(): Promise<void> {
    const samples = [
      {
        type: 'order' as const,
        title: 'Order Confirmed!',
        message: 'Your order #12345 has been confirmed and is being prepared.',
        action: {
          type: 'navigate' as const,
          data: { screen: 'order-status', orderId: '12345' }
        },
        metadata: { orderId: '12345' }
      },
      {
        type: 'promotion' as const,
        title: 'Special Offer!',
        message: 'Get 20% off on healthy meals this week. Limited time only!',
        action: {
          type: 'navigate' as const,
          data: { screen: 'search' }
        }
      },
      {
        type: 'reminder' as const,
        title: 'Meal Time Reminder',
        message: 'Don\'t forget to have your scheduled meal. Stay healthy!',
        action: {
          type: 'navigate' as const,
          data: { screen: 'meal-plan-builder' }
        }
      }
    ];

    for (const sample of samples) {
      await this.sendLocalNotification(sample);
      // Add delay between notifications
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

export default NotificationService;