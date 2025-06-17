
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { GmailAuthService } from '@/services/gmail/gmailAuthService';
import { CalendarNotificationManager } from './core/CalendarNotificationManager';
import { CalendarNotificationResultHandler } from './core/CalendarNotificationResultHandler';
import { emailServiceV2 } from '@/services/email/v2/EmailServiceV2';

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
  private resultHandler: CalendarNotificationResultHandler;

  constructor(toast: ReturnType<typeof useToast>['toast'], queryClient: ReturnType<typeof useQueryClient>) {
    this.toast = toast;
    this.queryClient = queryClient;
    this.gmailAuthService = new GmailAuthService(toast);
    this.notificationManager = new CalendarNotificationManager(toast, queryClient);
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

    // Process email notifications using EmailServiceV2 directly
    let notificationsSent = 0;
    let notificationsFailed = 0;
    const emailFailures: string[] = [];

    for (const user of selectedUsers) {
      try {
        const actionType = isUpdate ? "actualizado" : "creado";
        const subject = `Evento ${actionType}: ${eventTitle}`;
        
        // Create event details object for EmailServiceV2
        const eventDetails = {
          title: eventTitle,
          description: eventDescription,
          eventDate: eventDate,
          eventType: eventType,
          location: location,
          veterinarian: veterinarian
        };

        console.log(`📧 [CALENDAR NOTIFICATION PROCESSOR] ===== SENDING EMAIL =====`);
        console.log(`📧 [CALENDAR NOTIFICATION PROCESSOR] To: ${user.email}`);
        console.log(`📧 [CALENDAR NOTIFICATION PROCESSOR] Subject: ${subject}`);
        console.log(`📧 [CALENDAR NOTIFICATION PROCESSOR] Event Details:`, eventDetails);
        
        // Use EmailServiceV2 directly - this is the proven working path
        console.log('📧 [CALENDAR NOTIFICATION PROCESSOR] Calling emailServiceV2.sendEmail...');
        const success = await emailServiceV2.sendEmail(
          user.email,
          subject,
          '', // Empty body as EmailServiceV2 will generate from eventDetails
          eventDetails
        );
        
        console.log(`📧 [CALENDAR NOTIFICATION PROCESSOR] EmailServiceV2 returned:`, success);
        
        if (success) {
          notificationsSent++;
          console.log(`✅ [CALENDAR NOTIFICATION PROCESSOR] Email sent successfully to ${user.email}`);
        } else {
          notificationsFailed++;
          emailFailures.push(`${user.email}: Email sending returned false`);
          console.error(`❌ [CALENDAR NOTIFICATION PROCESSOR] Email returned false for ${user.email}`);
        }
      } catch (error) {
        notificationsFailed++;
        emailFailures.push(`${user.email}: ${error.message}`);
        console.error(`❌ [CALENDAR NOTIFICATION PROCESSOR] Email error for ${user.email}:`, error);
        console.error(`❌ [CALENDAR NOTIFICATION PROCESSOR] Full error details:`, {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
    }

    console.log(`📊 [CALENDAR NOTIFICATION PROCESSOR] ===== FINAL RESULTS =====`);
    console.log(`📊 [CALENDAR NOTIFICATION PROCESSOR] Notifications sent: ${notificationsSent}`);
    console.log(`📊 [CALENDAR NOTIFICATION PROCESSOR] Notifications failed: ${notificationsFailed}`);
    console.log(`📊 [CALENDAR NOTIFICATION PROCESSOR] Failures:`, emailFailures);

    // Show results
    this.resultHandler.showNotificationResults(notificationsSent, notificationsFailed, emailFailures);

    // Show permission warning if needed
    this.notificationManager.checkNotificationPermissions();

    // Refresh notifications
    this.notificationManager.refreshNotifications();
  }
}
