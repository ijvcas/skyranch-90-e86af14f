
import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNotificationQueries } from './notifications/queries';
import { useNotificationMutations } from './notifications/mutations';

export { Notification } from './notifications/types';

export const useNotifications = () => {
  const queryClient = useQueryClient();
  const { notifications, isLoading, unreadCount } = useNotificationQueries();
  const {
    markAsReadMutation,
    deleteNotificationMutation,
    addNotificationMutation,
    markAllAsReadMutation,
    clearAllNotificationsMutation
  } = useNotificationMutations();

  const markAsRead = useCallback(async (notificationId: string) => {
    await markAsReadMutation.mutateAsync(notificationId);
  }, [markAsReadMutation]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    await deleteNotificationMutation.mutateAsync(notificationId);
  }, [deleteNotificationMutation]);

  const addNotification = useCallback(async (notification: Omit<import('./notifications/types').Notification, 'id' | 'created_at'>) => {
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
