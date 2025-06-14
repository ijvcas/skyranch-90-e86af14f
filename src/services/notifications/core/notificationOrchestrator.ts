
import { emailNotificationService } from './emailNotificationService';
import { pushNotificationService } from './pushNotificationService';
import { userNotificationService } from './userNotificationService';

export class NotificationOrchestrator {
  async sendNotification(
    userId: string, 
    userEmail: string, 
    title: string, 
    message: string,
    eventDetails?: { title: string; description?: string; eventDate: string }
  ): Promise<void> {
    console.log('📢 [NOTIFICATION ORCHESTRATOR] Starting notification process');
    console.log('📢 [NOTIFICATION ORCHESTRATOR] Parameters:', {
      userId,
      userEmail,
      title,
      message,
      hasEventDetails: !!eventDetails
    });
    
    try {
      // Get user preferences
      const preferences = await userNotificationService.getUserPreferences(userId);
      console.log('📢 [NOTIFICATION ORCHESTRATOR] User preferences:', preferences);
      
      // Send email notification if enabled and email available
      if (preferences.email && userEmail) {
        console.log('📢 [NOTIFICATION ORCHESTRATOR] Sending email notification...');
        
        try {
          const emailSuccess = await emailNotificationService.sendEmailNotification(userEmail, title, message, eventDetails);
          console.log('📢 [NOTIFICATION ORCHESTRATOR] Email notification result:', emailSuccess);
          
          await userNotificationService.logNotification({
            userId,
            type: 'email',
            status: 'sent',
            message: `${title}: ${message}`,
            sentAt: new Date().toISOString()
          });
          
        } catch (emailError) {
          console.error('❌ [NOTIFICATION ORCHESTRATOR] Email failed:', emailError);
          
          await userNotificationService.logNotification({
            userId,
            type: 'email',
            status: 'failed',
            message: `${title}: ${message}`,
            error: `Email error: ${emailError.message}`
          });
        }
      } else {
        console.log('📢 [NOTIFICATION ORCHESTRATOR] Email notification skipped - preferences disabled or no email');
      }

      // Send push notification if enabled
      if (preferences.push) {
        console.log('📢 [NOTIFICATION ORCHESTRATOR] Sending push notification...');
        try {
          const pushSuccess = await pushNotificationService.sendPushNotification(userId, title, message);
          console.log('📢 [NOTIFICATION ORCHESTRATOR] Push notification result:', pushSuccess);
          
          await userNotificationService.logNotification({
            userId,
            type: 'push',
            status: pushSuccess ? 'sent' : 'failed',
            message: `${title}: ${message}`,
            sentAt: pushSuccess ? new Date().toISOString() : undefined,
            error: pushSuccess ? undefined : 'Failed to send push notification'
          });
        } catch (pushError) {
          console.error('❌ [NOTIFICATION ORCHESTRATOR] Push notification failed:', pushError);
          await userNotificationService.logNotification({
            userId,
            type: 'push',
            status: 'failed',
            message: `${title}: ${message}`,
            error: `Push error: ${pushError.message}`
          });
        }
      } else {
        console.log('📢 [NOTIFICATION ORCHESTRATOR] Push notification skipped - user preference disabled');
      }

      console.log('📢 [NOTIFICATION ORCHESTRATOR] Notification process completed');
    } catch (error) {
      console.error('❌ [NOTIFICATION ORCHESTRATOR] Critical error:', error);
      throw new Error(`Notification process failed: ${error.message}`);
    }
  }
}

export const notificationOrchestrator = new NotificationOrchestrator();
