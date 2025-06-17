
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

    console.log(`📢 [CALENDAR NOTIFICATION PROCESSOR] Processing notifications for ${selectedUserIds.length} users`);
    
    const selectedUsers = users.filter(user => selectedUserIds.includes(user.id));
    console.log('🔄 [CALENDAR NOTIFICATION PROCESSOR] Found matching users:', selectedUsers.map(u => ({ id: u.id, email: u.email })));
    
    if (selectedUsers.length === 0) {
      console.error('❌ [CALENDAR NOTIFICATION PROCESSOR] No matching users found in user list!');
      return;
    }

    // Create in-app notification
    await this.notificationManager.createInAppNotification(eventTitle, eventDate);

    // Try to get Gmail access token first
    console.log('🔐 [CALENDAR NOTIFICATION PROCESSOR] Attempting Gmail authentication...');
    const accessToken = await this.gmailAuthService.getAccessToken();
    
    if (accessToken) {
      console.log('✅ [CALENDAR NOTIFICATION PROCESSOR] Gmail token obtained, using Gmail API');
      
      // Process email notifications via Gmail
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
    } else {
      console.log('❌ [CALENDAR NOTIFICATION PROCESSOR] No Gmail token available, falling back to Resend');
      
      // Fall back to using the email notification service (Resend)
      try {
        // Import the email service dynamically to avoid circular dependencies
        const { emailServiceV2 } = await import('@/services/email/v2/EmailServiceV2');
        
        let notificationsSent = 0;
        let notificationsFailed = 0;
        const emailFailures: string[] = [];

        for (const user of selectedUsers) {
          try {
            const actionType = isUpdate ? "actualizado" : "creado";
            const subject = `Evento ${actionType}: ${eventTitle}`;
            const body = `
              <h2>Evento ${actionType}</h2>
              <p><strong>Título:</strong> ${eventTitle}</p>
              <p><strong>Fecha:</strong> ${eventDate}</p>
              ${eventDescription ? `<p><strong>Descripción:</strong> ${eventDescription}</p>` : ''}
              ${eventType ? `<p><strong>Tipo:</strong> ${eventType}</p>` : ''}
              ${location ? `<p><strong>Ubicación:</strong> ${location}</p>` : ''}
              ${veterinarian ? `<p><strong>Veterinario:</strong> ${veterinarian}</p>` : ''}
            `;

            const success = await emailServiceV2.sendEmail(user.email, subject, body);
            
            if (success) {
              notificationsSent++;
              console.log(`✅ Email sent successfully to ${user.email}`);
            } else {
              notificationsFailed++;
              emailFailures.push(`${user.email}: Email sending failed`);
              console.error(`❌ Email failed for ${user.email}`);
            }
          } catch (error) {
            notificationsFailed++;
            emailFailures.push(`${user.email}: ${error.message}`);
            console.error(`❌ Email error for ${user.email}:`, error);
          }
        }

        this.resultHandler.showNotificationResults(notificationsSent, notificationsFailed, emailFailures);
      } catch (error) {
        console.error('❌ [CALENDAR NOTIFICATION PROCESSOR] Fallback email service failed:', error);
        this.toast({
          title: "❌ Error de Notificación",
          description: "No se pudieron enviar las notificaciones por correo.",
          variant: "destructive"
        });
      }
    }

    // Show permission warning if needed
    this.notificationManager.checkNotificationPermissions();

    // Refresh notifications
    this.notificationManager.refreshNotifications();
  }
}
