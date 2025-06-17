
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { supabaseNotificationService } from '@/services/notifications/supabaseNotificationService';
import { pushService } from '@/services/notifications/pushService';
import { GmailAuthService } from '@/services/gmail/gmailAuthService';
import { EmailNotificationService } from '@/services/notifications/emailNotificationService';

interface NotificationUser {
  id: string;
  email: string;
  name?: string;
  full_name?: string;
}

export class CalendarNotificationProcessor {
  private toast: ReturnType<typeof useToast>['toast'];
  private queryClient: ReturnType<typeof useQueryClient>;
  private gmailAuthService: GmailAuthService;
  private emailNotificationService: EmailNotificationService;

  constructor(toast: ReturnType<typeof useToast>['toast'], queryClient: ReturnType<typeof useQueryClient>) {
    this.toast = toast;
    this.queryClient = queryClient;
    this.gmailAuthService = new GmailAuthService(toast);
    this.emailNotificationService = new EmailNotificationService();
  }

  async processNotifications(
    selectedUserIds: string[],
    users: NotificationUser[],
    eventTitle: string,
    eventDate: string,
    isUpdate: boolean = false,
    eventDescription?: string,
    eventType?: string,
    location?: string,
    veterinarian?: string
  ) {
    console.log('🔄 [CALENDAR NOTIFICATION - GMAIL] ===== STARTING NOTIFICATION PROCESS =====');
    console.log('🔄 [CALENDAR NOTIFICATION - GMAIL] Input parameters:', {
      selectedUserIds: selectedUserIds.length,
      selectedUserIdsList: selectedUserIds,
      eventTitle,
      eventDate,
      isUpdate,
      eventDescription
    });
    
    if (selectedUserIds.length === 0) {
      console.log('📢 [CALENDAR NOTIFICATION - GMAIL] ❌ No users selected for notification - exiting');
      return;
    }

    console.log(`📢 [CALENDAR NOTIFICATION - GMAIL] Processing Gmail notifications for ${selectedUserIds.length} users`);
    
    const selectedUsers = users.filter(user => selectedUserIds.includes(user.id));
    console.log('🔄 [CALENDAR NOTIFICATION - GMAIL] Found matching users:', selectedUsers.map(u => ({ id: u.id, email: u.email })));
    
    if (selectedUsers.length === 0) {
      console.error('❌ [CALENDAR NOTIFICATION - GMAIL] No matching users found in user list!');
      return;
    }

    // Create in-app notification
    await this.createInAppNotification(eventTitle, eventDate);

    // Get Gmail access token
    const accessToken = await this.gmailAuthService.getAccessToken();
    if (!accessToken) {
      this.toast({
        title: "❌ Error de Autenticación",
        description: "No se pudo autenticar con Gmail. Las notificaciones no se enviaron.",
        variant: "destructive"
      });
      return;
    }

    // Process email notifications
    await this.sendEmailNotifications(selectedUsers, {
      eventTitle,
      eventDate,
      eventDescription,
      eventType,
      location,
      veterinarian,
      isUpdate,
      accessToken
    });

    // Show permission warning if needed
    this.checkNotificationPermissions();

    // Refresh notifications
    this.queryClient.invalidateQueries({ queryKey: ['real-notifications'] });
  }

  private async createInAppNotification(eventTitle: string, eventDate: string) {
    try {
      console.log('🔄 [CALENDAR NOTIFICATION - GMAIL] Creating in-app notification...');
      await supabaseNotificationService.createCalendarNotification(eventTitle, eventDate);
      console.log('✅ [CALENDAR NOTIFICATION - GMAIL] In-app notification created successfully');
    } catch (error) {
      console.error('❌ [CALENDAR NOTIFICATION - GMAIL] Error creating in-app notification:', error);
    }
  }

  private async sendEmailNotifications(
    selectedUsers: NotificationUser[],
    params: {
      eventTitle: string;
      eventDate: string;
      eventDescription?: string;
      eventType?: string;
      location?: string;
      veterinarian?: string;
      isUpdate: boolean;
      accessToken: string;
    }
  ) {
    let notificationsSent = 0;
    let notificationsFailed = 0;
    const emailFailures: string[] = [];

    for (const user of selectedUsers) {
      const result = await this.emailNotificationService.sendEmailNotification({
        user,
        ...params
      }, selectedUsers);

      if (result.success) {
        notificationsSent++;
      } else {
        notificationsFailed++;
        emailFailures.push(`${user.email}: ${result.error}`);
      }
    }

    this.showNotificationResults(notificationsSent, notificationsFailed, emailFailures);
  }

  private showNotificationResults(sent: number, failed: number, failures: string[]) {
    console.log(`🔄 [CALENDAR NOTIFICATION - GMAIL] ===== NOTIFICATION SUMMARY =====`);
    console.log(`🔄 [CALENDAR NOTIFICATION - GMAIL] Notifications sent via Gmail: ${sent}`);
    console.log(`🔄 [CALENDAR NOTIFICATION - GMAIL] Notifications failed: ${failed}`);
    if (failures.length > 0) {
      console.log(`🔄 [CALENDAR NOTIFICATION - GMAIL] Email failures:`, failures);
    }

    if (sent > 0) {
      this.toast({
        title: "✅ Notificaciones Enviadas",
        description: `Se enviaron ${sent} notificación(es) correctamente via Gmail desde soporte@skyranch.es`,
      });
    }

    if (failed > 0) {
      if (sent === 0) {
        this.toast({
          title: "❌ Error de Notificaciones",
          description: `No se pudieron enviar ${failed} notificación(es). Verifica la autenticación OAuth de Gmail.`,
          variant: "destructive"
        });
      } else {
        this.toast({
          title: "⚠️ Notificaciones Parciales",
          description: `${sent} enviadas, ${failed} fallaron. Algunos usuarios pueden no haber recibido la notificación.`,
          variant: "destructive"
        });
      }
    }
  }

  private checkNotificationPermissions() {
    const permissionStatus = pushService.getPermissionStatus();
    console.log(`📱 [CALENDAR NOTIFICATION - GMAIL] Notification permission status: ${permissionStatus}`);

    if (permissionStatus !== 'granted' && pushService.isSupported()) {
      this.toast({
        title: "Permisos de notificación",
        description: "Para recibir notificaciones push, permite las notificaciones en tu navegador",
        variant: "destructive"
      });
    }
  }
}
