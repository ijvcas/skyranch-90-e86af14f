
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { GmailAuthService } from '@/services/gmail/gmailAuthService';
import { CalendarNotificationManager } from './core/CalendarNotificationManager';
import { CalendarEmailProcessor } from './core/CalendarEmailProcessor';
import { CalendarNotificationResultHandler } from './core/CalendarNotificationResultHandler';

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
  private notificationManager: CalendarNotificationManager;
  private emailProcessor: CalendarEmailProcessor;
  private resultHandler: CalendarNotificationResultHandler;

  constructor(toast: ReturnType<typeof useToast>['toast'], queryClient: ReturnType<typeof useQueryClient>) {
    this.toast = toast;
    this.queryClient = queryClient;
    this.gmailAuthService = new GmailAuthService(toast);
    this.notificationManager = new CalendarNotificationManager(toast, queryClient);
    this.emailProcessor = new CalendarEmailProcessor();
    this.resultHandler = new CalendarNotificationResultHandler(toast);
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
    console.log('🔄 [CALENDAR NOTIFICATION PROCESSOR] ===== STARTING NOTIFICATION PROCESS =====');
    console.log('🔄 [CALENDAR NOTIFICATION PROCESSOR] Input parameters:', {
      selectedUserIds: selectedUserIds.length,
      selectedUserIdsList: selectedUserIds,
      eventTitle,
      eventDate,
      isUpdate,
      eventDescription
    });
    
    if (selectedUserIds.length === 0) {
      console.log('📢 [CALENDAR NOTIFICATION PROCESSOR] ❌ No users selected for notification - exiting');
      return;
    }

    console.log(`📢 [CALENDAR NOTIFICATION PROCESSOR] Processing Gmail notifications for ${selectedUserIds.length} users`);
    
    const selectedUsers = users.filter(user => selectedUserIds.includes(user.id));
    console.log('🔄 [CALENDAR NOTIFICATION PROCESSOR] Found matching users:', selectedUsers.map(u => ({ id: u.id, email: u.email })));
    
    if (selectedUsers.length === 0) {
      console.error('❌ [CALENDAR NOTIFICATION PROCESSOR] No matching users found in user list!');
      return;
    }

    // Create in-app notification
    await this.notificationManager.createInAppNotification(eventTitle, eventDate);

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
    const result = await this.emailProcessor.processEmailNotifications(selectedUsers, {
      eventTitle,
      eventDate,
      eventDescription,
      eventType,
      location,
      veterinarian,
      isUpdate,
      accessToken
    });

    // Show results
    this.resultHandler.showNotificationResults(result.sent, result.failed, result.failures);

    // Show permission warning if needed
    this.notificationManager.checkNotificationPermissions();

    // Refresh notifications
    this.notificationManager.refreshNotifications();
  }
}
