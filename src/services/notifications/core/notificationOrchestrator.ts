
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
    console.log('📢 [ORCHESTRATOR] Sending notification to:', userEmail);
    
    try {
      const preferences = await userNotificationService.getUserPreferences(userId);
      console.log('📢 [ORCHESTRATOR] User preferences:', preferences);
      
      if (preferences.email && userEmail) {
        console.log('📢 [ORCHESTRATOR] Sending email...');
        
        try {
          const emailSuccess = await emailNotificationService.sendEmailNotification(userEmail, title, message, eventDetails);
          console.log('📢 [ORCHESTRATOR] Email result:', emailSuccess);
          
          await userNotificationService.logNotification({
            userId,
            type: 'email',
            status: 'sent',
            message: `${title}: ${message}`,
            sentAt: new Date().toISOString()
          });
          
        } catch (emailError) {
          console.error('❌ [ORCHESTRATOR] Email failed:', emailError);
          
          await userNotificationService.logNotification({
            userId,
            type: 'email',
            status: 'failed',
            message: `${title}: ${message}`,
            error: emailError.message
          });

          // For most errors, log but don't throw to allow push notifications to still work
          console.warn('📢 [ORCHESTRATOR] Email failed but continuing with other notifications:', emailError.message);
        }
      }

      if (preferences.push) {
        console.log('📢 [ORCHESTRATOR] Sending push...');
        try {
          const pushSuccess = await pushNotificationService.sendPushNotification(userId, title, message);
          
          await userNotificationService.logNotification({
            userId,
            type: 'push',
            status: pushSuccess ? 'sent' : 'failed',
            message: `${title}: ${message}`,
            sentAt: pushSuccess ? new Date().toISOString() : undefined,
            error: pushSuccess ? undefined : 'Failed to send push notification'
          });
        } catch (pushError) {
          console.error('❌ [ORCHESTRATOR] Push failed:', pushError);
          await userNotificationService.logNotification({
            userId,
            type: 'push',
            status: 'failed',
            message: `${title}: ${message}`,
            error: pushError.message
          });
        }
      }

      console.log('📢 [ORCHESTRATOR] Notification process completed');
    } catch (error) {
      console.error('❌ [ORCHESTRATOR] Critical error:', error);
      throw error;
    }
  }
}

export const notificationOrchestrator = new NotificationOrchestrator();
