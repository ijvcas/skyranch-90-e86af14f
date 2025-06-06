import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getAllAnimals } from '@/services/animalService';

export interface Notification {
  id: string;
  type: 'vaccine' | 'health' | 'breeding' | 'weekly_report' | 'general';
  title: string;
  message: string;
  animalId?: string;
  animalName?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  createdAt: Date;
  scheduledFor?: Date;
  actionRequired?: boolean;
}

export interface NotificationSettings {
  vaccineReminders: boolean;
  healthAlerts: boolean;
  weeklyReports: boolean;
  breedingReminders: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  soundEnabled: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  vaccineReminders: true,
  healthAlerts: true,
  weeklyReports: false,
  breedingReminders: true,
  emailNotifications: false,
  pushNotifications: true,
  soundEnabled: true,
};

export const useNotifications = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load notifications and settings from localStorage
  useEffect(() => {
    const loadData = () => {
      try {
        const savedNotifications = localStorage.getItem('notifications');
        const savedSettings = localStorage.getItem('notificationSettings');
        
        if (savedNotifications) {
          const parsed = JSON.parse(savedNotifications);
          // Convert date strings back to Date objects
          const notifications = parsed.map((n: any) => ({
            ...n,
            createdAt: new Date(n.createdAt),
            scheduledFor: n.scheduledFor ? new Date(n.scheduledFor) : undefined,
          }));
          setNotifications(notifications);
        }
        
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save notifications to localStorage
  const saveNotifications = useCallback((notifications: Notification[]) => {
    try {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = useCallback((settings: NotificationSettings) => {
    try {
      localStorage.setItem('notificationSettings', JSON.stringify(settings));
      setSettings(settings);
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  }, []);

  // Add a new notification
  const addNotification = useCallback((
    type: Notification['type'],
    title: string,
    message: string,
    options: Partial<Notification> = {}
  ) => {
    const notification: Notification = {
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      message,
      priority: options.priority || 'medium',
      isRead: false,
      createdAt: new Date(),
      ...options,
    };

    setNotifications(prev => {
      const updated = [notification, ...prev];
      saveNotifications(updated);
      return updated;
    });

    // Show toast if enabled and not a scheduled notification
    if (!options.scheduledFor) {
      const priorityColors = {
        low: 'default',
        medium: 'default',
        high: 'destructive',
        critical: 'destructive'
      } as const;

      toast({
        title,
        description: message,
        variant: priorityColors[notification.priority],
      });

      // Play sound if enabled
      if (settings.soundEnabled) {
        try {
          const audio = new Audio('/notification-sound.mp3');
          audio.volume = 0.3;
          audio.play().catch(() => {
            // Ignore audio play errors (user interaction required)
          });
        } catch (error) {
          console.log('Audio notification not available');
        }
      }
    }

    return notification.id;
  }, [toast, settings.soundEnabled, saveNotifications]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      );
      saveNotifications(updated);
      return updated;
    });
  }, [saveNotifications]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, isRead: true }));
      saveNotifications(updated);
      return updated;
    });
  }, [saveNotifications]);

  // Delete notification
  const deleteNotification = useCallback((notificationId: string) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== notificationId);
      saveNotifications(updated);
      return updated;
    });
  }, [saveNotifications]);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    saveNotifications([]);
  }, [saveNotifications]);

  // Check for health alerts
  const checkHealthAlerts = useCallback(async () => {
    if (!settings.healthAlerts) return;

    try {
      const animals = await getAllAnimals();
      const now = new Date();

      animals.forEach((animal: any) => {
        // Check for unhealthy animals
        if (animal.healthStatus === 'sick' || animal.healthStatus === 'injured') {
          const existingAlert = notifications.find(n => 
            n.type === 'health' && 
            n.animalId === animal.id && 
            !n.isRead &&
            n.createdAt > new Date(now.getTime() - 24 * 60 * 60 * 1000) // Within last 24 hours
          );

          if (!existingAlert) {
            addNotification(
              'health',
              'Alerta de Salud',
              `${animal.name} (${animal.tag}) requiere atención médica - Estado: ${animal.healthStatus}`,
              {
                animalId: animal.id,
                animalName: animal.name,
                priority: 'high',
                actionRequired: true,
              }
            );
          }
        }

        // Check for overweight animals (if weight is tracked)
        if (animal.weight && parseFloat(animal.weight) > 800) { // Example threshold
          const existingAlert = notifications.find(n => 
            n.type === 'health' && 
            n.animalId === animal.id && 
            n.message.includes('sobrepeso') &&
            !n.isRead &&
            n.createdAt > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // Within last week
          );

          if (!existingAlert) {
            addNotification(
              'health',
              'Alerta de Peso',
              `${animal.name} (${animal.tag}) puede tener sobrepeso - Peso: ${animal.weight}kg`,
              {
                animalId: animal.id,
                animalName: animal.name,
                priority: 'medium',
              }
            );
          }
        }
      });
    } catch (error) {
      console.error('Error checking health alerts:', error);
    }
  }, [settings.healthAlerts, notifications, addNotification]);

  // Check for vaccine reminders
  const checkVaccineReminders = useCallback(async () => {
    if (!settings.vaccineReminders) return;

    try {
      const animals = await getAllAnimals();
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      animals.forEach((animal: any) => {
        // Example: Check if animal needs annual vaccination
        const birthDate = animal.birthDate ? new Date(animal.birthDate) : null;
        if (birthDate) {
          const nextVaccineDate = new Date(birthDate);
          nextVaccineDate.setFullYear(nextVaccineDate.getFullYear() + 1);

          if (nextVaccineDate <= thirtyDaysFromNow && nextVaccineDate > now) {
            const existingReminder = notifications.find(n => 
              n.type === 'vaccine' && 
              n.animalId === animal.id && 
              !n.isRead &&
              n.createdAt > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // Within last week
            );

            if (!existingReminder) {
              addNotification(
                'vaccine',
                'Recordatorio de Vacuna',
                `${animal.name} (${animal.tag}) necesita vacunación anual - Fecha: ${nextVaccineDate.toLocaleDateString('es-ES')}`,
                {
                  animalId: animal.id,
                  animalName: animal.name,
                  priority: 'medium',
                  scheduledFor: nextVaccineDate,
                  actionRequired: true,
                }
              );
            }
          }
        }
      });
    } catch (error) {
      console.error('Error checking vaccine reminders:', error);
    }
  }, [settings.vaccineReminders, notifications, addNotification]);

  // Generate weekly report
  const generateWeeklyReport = useCallback(async () => {
    if (!settings.weeklyReports) return;

    try {
      const animals = await getAllAnimals();
      const now = new Date();
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Check if we already sent a report this week
      const existingReport = notifications.find(n => 
        n.type === 'weekly_report' && 
        n.createdAt > lastWeek
      );

      if (!existingReport) {
        const healthyCount = animals.filter(a => a.healthStatus === 'healthy').length;
        const sickCount = animals.filter(a => a.healthStatus === 'sick' || a.healthStatus === 'injured').length;
        const totalCount = animals.length;

        const report = `
          Total de animales: ${totalCount}
          Animales sanos: ${healthyCount}
          Animales que requieren atención: ${sickCount}
          
          Estado general de la granja: ${sickCount === 0 ? 'Excelente' : sickCount < totalCount * 0.1 ? 'Bueno' : 'Requiere atención'}
        `;

        addNotification(
          'weekly_report',
          'Reporte Semanal',
          report.trim(),
          {
            priority: 'low',
          }
        );
      }
    } catch (error) {
      console.error('Error generating weekly report:', error);
    }
  }, [settings.weeklyReports, notifications, addNotification]);

  // Run periodic checks
  useEffect(() => {
    if (isLoading) return;

    const runChecks = () => {
      checkHealthAlerts();
      checkVaccineReminders();
      generateWeeklyReport();
    };

    // Run checks immediately
    runChecks();

    // Set up interval to run checks every hour
    const interval = setInterval(runChecks, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isLoading, checkHealthAlerts, checkVaccineReminders, generateWeeklyReport]);

  // Get unread count
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Get notifications by type
  const getNotificationsByType = useCallback((type: Notification['type']) => {
    return notifications.filter(n => n.type === type);
  }, [notifications]);

  // Get high priority notifications
  const getHighPriorityNotifications = useCallback(() => {
    return notifications.filter(n => 
      (n.priority === 'high' || n.priority === 'critical') && !n.isRead
    );
  }, [notifications]);

  return {
    notifications,
    settings,
    isLoading,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    saveSettings,
    getNotificationsByType,
    getHighPriorityNotifications,
    checkHealthAlerts,
    checkVaccineReminders,
    generateWeeklyReport,
  };
};
