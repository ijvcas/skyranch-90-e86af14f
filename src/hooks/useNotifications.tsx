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
        // Clear corrupted data
        localStorage.removeItem('notifications');
        localStorage.removeItem('notificationSettings');
        setNotifications([]);
        setSettings(DEFAULT_SETTINGS);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save notifications to localStorage with error handling
  const saveNotifications = useCallback((notifications: Notification[]) => {
    try {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
      toast({
        title: "Error",
        description: "No se pudieron guardar las notificaciones.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Save settings to localStorage
  const saveSettings = useCallback((settings: NotificationSettings) => {
    try {
      localStorage.setItem('notificationSettings', JSON.stringify(settings));
      setSettings(settings);
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast({
        title: "Error",
        description: "No se pudieron guardar las configuraciones.",
        variant: "destructive"
      });
    }
  }, [toast]);

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

    // Show toast and push notification if enabled
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

      // Try to send push notification if enabled
      if (settings.pushNotifications && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          try {
            new Notification(title, {
              body: message,
              icon: '/lovable-uploads/953e2699-9daf-4fea-86c8-e505a1e54eb3.png',
              tag: notification.id,
              requireInteraction: notification.priority === 'critical' || notification.priority === 'high'
            });
          } catch (error) {
            console.log('Push notification failed:', error);
          }
        } else if (Notification.permission === 'default') {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              try {
                new Notification(title, {
                  body: message,
                  icon: '/lovable-uploads/953e2699-9daf-4fea-86c8-e505a1e54eb3.png',
                  tag: notification.id
                });
              } catch (error) {
                console.log('Push notification failed:', error);
              }
            }
          });
        }
      }

      // Play sound if enabled
      if (settings.soundEnabled) {
        try {
          const audio = new Audio('/notification-sound.mp3');
          audio.volume = 0.3;
          audio.play().catch(() => {
            // Ignore audio play errors
          });
        } catch (error) {
          console.log('Audio notification not available');
        }
      }
    }

    return notification.id;
  }, [toast, settings.soundEnabled, settings.pushNotifications, saveNotifications]);

  // Mark notification as read with proper state sync
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

  // Delete notification with proper cleanup
  const deleteNotification = useCallback((notificationId: string) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== notificationId);
      saveNotifications(updated);
      return updated;
    });
    
    // Also clear any browser notifications with the same tag
    if ('Notification' in window && 'getNotifications' in window.navigator.serviceWorker) {
      navigator.serviceWorker.getNotifications({ tag: notificationId }).then(notifications => {
        notifications.forEach(notification => notification.close());
      }).catch(() => {
        // Ignore errors, service worker might not be available
      });
    }
  }, [saveNotifications]);

  // Clear all notifications with proper cleanup
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    saveNotifications([]);
    
    // Clear all browser notifications
    if ('Notification' in window && 'getNotifications' in window.navigator.serviceWorker) {
      navigator.serviceWorker.getNotifications().then(notifications => {
        notifications.forEach(notification => notification.close());
      }).catch(() => {
        // Ignore errors
      });
    }
  }, [saveNotifications]);

  // Check for health alerts
  const checkHealthAlerts = useCallback(async () => {
    if (!settings.healthAlerts) return;

    try {
      const animals = await getAllAnimals();
      const now = new Date();

      animals.forEach((animal: any) => {
        if (animal.healthStatus === 'sick' || animal.healthStatus === 'injured') {
          const existingAlert = notifications.find(n => 
            n.type === 'health' && 
            n.animalId === animal.id && 
            !n.isRead &&
            n.createdAt > new Date(now.getTime() - 24 * 60 * 60 * 1000)
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

        if (animal.weight && parseFloat(animal.weight) > 800) {
          const existingAlert = notifications.find(n => 
            n.type === 'health' && 
            n.animalId === animal.id && 
            n.message.includes('sobrepeso') &&
            !n.isRead &&
            n.createdAt > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
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
        const birthDate = animal.birthDate ? new Date(animal.birthDate) : null;
        if (birthDate) {
          const nextVaccineDate = new Date(birthDate);
          nextVaccineDate.setFullYear(nextVaccineDate.getFullYear() + 1);

          if (nextVaccineDate <= thirtyDaysFromNow && nextVaccineDate > now) {
            const existingReminder = notifications.find(n => 
              n.type === 'vaccine' && 
              n.animalId === animal.id && 
              !n.isRead &&
              n.createdAt > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
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

    runChecks();
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
