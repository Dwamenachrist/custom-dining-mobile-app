import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import NotificationService, { NotificationData, NotificationPreferences } from './services/notificationService';

interface NotificationContextType {
  notifications: NotificationData[];
  unreadCount: number;
  preferences: NotificationPreferences;
  loading: boolean;
  sendNotification: (notification: Omit<NotificationData, 'id' | 'timestamp' | 'read'>) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  updatePreferences: (preferences: NotificationPreferences) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  sendSampleNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    orderNotifications: true,
    promotionNotifications: true,
    reminderNotifications: true,
    mealPlanNotifications: true,
    systemNotifications: true,
    soundEnabled: true,
    vibrationEnabled: true,
  });
  const [loading, setLoading] = useState(true);

  const notificationService = NotificationService.getInstance();

  // Initialize notification service
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        await notificationService.initialize();
        await loadNotifications();
        await loadPreferences();
      } catch (error) {
        console.error('❌ Error initializing notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeNotifications();

    // Cleanup on unmount
    return () => {
      notificationService.cleanup();
    };
  }, []);

  // Load notifications from storage
  const loadNotifications = async () => {
    try {
      const storedNotifications = await notificationService.getNotifications();
      setNotifications(storedNotifications);
      
      const unread = await notificationService.getUnreadNotifications();
      setUnreadCount(unread.length);
    } catch (error) {
      console.error('❌ Error loading notifications:', error);
    }
  };

  // Load preferences from storage
  const loadPreferences = async () => {
    try {
      const storedPreferences = await notificationService.getNotificationPreferences();
      setPreferences(storedPreferences);
    } catch (error) {
      console.error('❌ Error loading preferences:', error);
    }
  };

  // Send notification
  const sendNotification = async (notification: Omit<NotificationData, 'id' | 'timestamp' | 'read'>) => {
    try {
      await notificationService.sendLocalNotification(notification);
      await loadNotifications(); // Refresh the list
    } catch (error) {
      console.error('❌ Error sending notification:', error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markNotificationAsRead(notificationId);
      await loadNotifications(); // Refresh the list
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllNotificationsAsRead();
      await loadNotifications(); // Refresh the list
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      await loadNotifications(); // Refresh the list
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    try {
      await notificationService.clearAllNotifications();
      await loadNotifications(); // Refresh the list
    } catch (error) {
      console.error('❌ Error clearing all notifications:', error);
    }
  };

  // Update preferences
  const updatePreferences = async (newPreferences: NotificationPreferences) => {
    try {
      await notificationService.saveNotificationPreferences(newPreferences);
      setPreferences(newPreferences);
    } catch (error) {
      console.error('❌ Error updating preferences:', error);
    }
  };

  // Refresh notifications
  const refreshNotifications = async () => {
    await loadNotifications();
  };

  // Send sample notifications for testing
  const sendSampleNotifications = async () => {
    try {
      await notificationService.sendSampleNotifications();
      await loadNotifications(); // Refresh the list
    } catch (error) {
      console.error('❌ Error sending sample notifications:', error);
    }
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    preferences,
    loading,
    sendNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    updatePreferences,
    refreshNotifications,
    sendSampleNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use notification context
export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}; 