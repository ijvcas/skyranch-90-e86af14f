
import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Define the notification interface to match what's being used
export interface Notification {
  id: string;
  type: 'vaccine' | 'health' | 'breeding' | 'weekly_report' | 'info' | 'warning' | 'error' | 'success';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  animalName?: string;
  actionRequired?: boolean;
}

// Mock functions for demonstration - replace with actual service calls
const mockGetNotifications = async (): Promise<Notification[]> => {
  return [];
};

const mockMarkAsRead = async (id: string): Promise<void> => {
  console.log('Marking notification as read:', id);
};

const mockDeleteNotification = async (id: string): Promise<void> => {
  console.log('Deleting notification:', id);
};

const mockCreateNotification = async (notification: Omit<Notification, 'id' | 'created_at'>): Promise<Notification> => {
  return {
    ...notification,
    id: Math.random().toString(36),
    created_at: new Date().toISOString()
  };
};

const mockMarkAllAsRead = async (): Promise<void> => {
  console.log('Marking all notifications as read');
};

const mockClearAllNotifications = async (): Promise<void> => {
  console.log('Clearing all notifications');
};

export const useNotifications = () => {
  const queryClient = useQueryClient();

  // Get notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: mockGetNotifications,
  });

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: mockMarkAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      console.error('Error marking notification as read:', error);
      toast.error('Error al marcar como leída');
    }
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: mockDeleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notificación eliminada');
    },
    onError: (error) => {
      console.error('Error deleting notification:', error);
      toast.error('Error al eliminar notificación');
    }
  });

  // Add notification mutation
  const addNotificationMutation = useMutation({
    mutationFn: mockCreateNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notificación creada');
    },
    onError: (error) => {
      console.error('Error creating notification:', error);
      toast.error('Error al crear notificación');
    }
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: mockMarkAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Todas las notificaciones marcadas como leídas');
    },
    onError: (error) => {
      console.error('Error marking all as read:', error);
      toast.error('Error al marcar todas como leídas');
    }
  });

  // Clear all notifications mutation
  const clearAllNotificationsMutation = useMutation({
    mutationFn: mockClearAllNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Todas las notificaciones eliminadas');
    },
    onError: (error) => {
      console.error('Error clearing all notifications:', error);
      toast.error('Error al eliminar todas las notificaciones');
    }
  });

  // Callback functions
  const markAsRead = useCallback(async (notificationId: string) => {
    await markAsReadMutation.mutateAsync(notificationId);
  }, [markAsReadMutation]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    await deleteNotificationMutation.mutateAsync(notificationId);
  }, [deleteNotificationMutation]);

  const addNotification = useCallback(async (notification: Omit<Notification, 'id' | 'created_at'>) => {
    await addNotificationMutation.mutateAsync(notification);
  }, [addNotificationMutation]);

  const markAllAsRead = useCallback(async () => {
    await markAllAsReadMutation.mutateAsync();
  }, [markAllAsReadMutation]);

  const clearAllNotifications = useCallback(async () => {
    await clearAllNotificationsMutation.mutateAsync();
  }, [clearAllNotificationsMutation]);

  const loadNotifications = useCallback(async () => {
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  }, [queryClient]);

  return {
    notifications,
    isLoading,
    unreadCount,
    markAsRead,
    deleteNotification,
    addNotification,
    markAllAsRead,
    clearAllNotifications,
    loadNotifications
  };
};
