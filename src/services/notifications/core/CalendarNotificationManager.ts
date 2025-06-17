
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { supabaseNotificationService } from '@/services/notifications/supabaseNotificationService';
import { pushService } from '@/services/notifications/pushService';

export class CalendarNotificationManager {
  private toast: ReturnType<typeof useToast>['toast'];
  private queryClient: ReturnType<typeof useQueryClient>;

  constructor(toast: ReturnType<typeof useToast>['toast'], queryClient: ReturnType<typeof useQueryClient>) {
    this.toast = toast;
    this.queryClient = queryClient;
  }

  async createInAppNotification(eventTitle: string, eventDate: string) {
    try {
      console.log('🔄 [CALENDAR NOTIFICATION MANAGER] Creating in-app notification...');
      await supabaseNotificationService.createCalendarNotification(eventTitle, eventDate);
      console.log('✅ [CALENDAR NOTIFICATION MANAGER] In-app notification created successfully');
    } catch (error) {
      console.error('❌ [CALENDAR NOTIFICATION MANAGER] Error creating in-app notification:', error);
    }
  }

  checkNotificationPermissions() {
    const permissionStatus = pushService.getPermissionStatus();
    console.log(`📱 [CALENDAR NOTIFICATION MANAGER] Notification permission status: ${permissionStatus}`);

    if (permissionStatus !== 'granted' && pushService.isSupported()) {
      this.toast({
        title: "Permisos de notificación",
        description: "Para recibir notificaciones push, permite las notificaciones en tu navegador",
        variant: "destructive"
      });
    }
  }

  refreshNotifications() {
    this.queryClient.invalidateQueries({ queryKey: ['real-notifications'] });
  }
}
