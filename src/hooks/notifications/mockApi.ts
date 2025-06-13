
import { Notification } from './types';

export const mockGetNotifications = async (): Promise<Notification[]> => {
  return [];
};

export const mockMarkAsRead = async (id: string): Promise<void> => {
  console.log('Marking notification as read:', id);
};

export const mockDeleteNotification = async (id: string): Promise<void> => {
  console.log('Deleting notification:', id);
};

export const mockCreateNotification = async (notification: Omit<Notification, 'id' | 'created_at'>): Promise<Notification> => {
  return {
    ...notification,
    id: Math.random().toString(36),
    created_at: new Date().toISOString()
  };
};

export const mockMarkAllAsRead = async (): Promise<void> => {
  console.log('Marking all notifications as read');
};

export const mockClearAllNotifications = async (): Promise<void> => {
  console.log('Clearing all notifications');
};
