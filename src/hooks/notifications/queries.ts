
import { useQuery } from '@tanstack/react-query';
import { mockGetNotifications } from './mockApi';

export const useNotificationQueries = () => {
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: mockGetNotifications,
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    isLoading,
    unreadCount
  };
};
