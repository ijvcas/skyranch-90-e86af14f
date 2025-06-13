
import { Notification } from './types';

// Mock notification data for development
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'vaccine',
    priority: 'high',
    title: 'Vacunación Pendiente',
    message: 'Luna necesita la vacuna antirrábica en 3 días',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    read: false,
    animalName: 'Luna',
    actionRequired: true
  },
  {
    id: '2',
    type: 'health',
    priority: 'medium',
    title: 'Revisión Veterinaria',
    message: 'Recordatorio: Revisión programada para Thor mañana',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    read: false,
    animalName: 'Thor',
    actionRequired: true
  },
  {
    id: '3',
    type: 'breeding',
    priority: 'low',
    title: 'Período de Celo',
    message: 'Bella está en período de celo - considerá la reproducción',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    read: true,
    animalName: 'Bella'
  }
];

// Store notifications in localStorage for persistence
const STORAGE_KEY = 'mockNotifications';

const getStoredNotifications = (): Notification[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : mockNotifications;
  } catch {
    return mockNotifications;
  }
};

const saveNotifications = (notifications: Notification[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  } catch (error) {
    console.error('Error saving notifications:', error);
  }
};

export const mockGetNotifications = async (): Promise<Notification[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return getStoredNotifications();
};

export const mockMarkAsRead = async (id: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const notifications = getStoredNotifications();
  const updated = notifications.map(n => 
    n.id === id ? { ...n, read: true } : n
  );
  saveNotifications(updated);
};

export const mockDeleteNotification = async (id: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const notifications = getStoredNotifications();
  const filtered = notifications.filter(n => n.id !== id);
  saveNotifications(filtered);
};

export const mockCreateNotification = async (notification: Omit<Notification, 'id' | 'created_at'>): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const notifications = getStoredNotifications();
  const newNotification: Notification = {
    ...notification,
    id: Date.now().toString(),
    created_at: new Date().toISOString()
  };
  saveNotifications([newNotification, ...notifications]);
};

export const mockMarkAllAsRead = async (): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  const notifications = getStoredNotifications();
  const updated = notifications.map(n => ({ ...n, read: true }));
  saveNotifications(updated);
};

export const mockClearAllNotifications = async (): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  saveNotifications([]);
};
