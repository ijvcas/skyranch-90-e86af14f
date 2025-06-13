
import { useState, useEffect, useCallback } from 'react';
import { 
  getNotifications, 
  markNotificationAsRead, 
  deleteNotification,
  createNotification 
} from '@/services/notifications/notificationService';
import { supabase } from '@/integrations/supabase/client';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const success = await markNotificationAsRead(notificationId);
      if (success) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  const deleteNotif = useCallback(async (notificationId: string) => {
    try {
      const success = await deleteNotification(notificationId);
      if (success) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        setUnreadCount(prev => {
          const notification = notifications.find(n => n.id === notificationId);
          return notification && !notification.isRead ? Math.max(0, prev - 1) : prev;
        });
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [notifications]);

  const addNotification = useCallback(async (notification: Omit<Notification, 'id' | 'userId' | 'createdAt' | 'isRead'>) => {
    try {
      const success = await createNotification(notification);
      if (success) {
        await loadNotifications();
      }
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }, [loadNotifications]);

  const markAllAsRead = useCallback(async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      
      for (const notification of unreadNotifications) {
        await markNotificationAsRead(notification.id);
      }
      
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [notifications]);

  // Real-time subscription
  useEffect(() => {
    const { data: { user } } = supabase.auth.getUser();
    
    if (!user) return;

    // Load initial notifications
    loadNotifications();

    // Set up real-time subscription
    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('Notification change detected, reloading...');
          loadNotifications();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [loadNotifications]);

  // Push notification setup (simplified without service worker getNotifications)
  useEffect(() => {
    const setupPushNotifications = async () => {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.log('Push messaging is not supported');
        return;
      }

      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully');
        
        // Check current subscription
        const subscription = await registration.pushManager.getSubscription();
        if (!subscription) {
          console.log('No existing push subscription found');
        }
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    };

    setupPushNotifications();
  }, []);

  // Cleanup effect for managing notification persistence
  useEffect(() => {
    const cleanup = () => {
      // Clear any temporary UI states
      setIsLoading(false);
    };

    window.addEventListener('beforeunload', cleanup);
    return () => {
      window.removeEventListener('beforeunload', cleanup);
      cleanup();
    };
  }, []);

  return {
    notifications,
    isLoading,
    unreadCount,
    markAsRead,
    deleteNotif,
    addNotification,
    markAllAsRead,
    loadNotifications
  };
};
