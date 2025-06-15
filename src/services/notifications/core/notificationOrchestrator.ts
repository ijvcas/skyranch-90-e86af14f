
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
          
          let errorMessage = emailError.message;
          
          // Handle specific email error types
          if (emailError.message.includes('Domain verification required')) {
            errorMessage = `Email not sent to ${userEmail}: Domain verification required`;
          } else if (emailError.message.includes('Email API error')) {
            errorMessage = `Email API error for ${userEmail}: ${emailError.message}`;
          }
          
          await userNotificationService.logNotification({
            userId,
            type: 'email',
            status: 'failed',
            message: `${title}: ${message}`,
            error: errorMessage
          });

          // Re-throw domain verification errors so they can be handled by the UI
          if (emailError.message.includes('Domain verification required')) {
            throw new Error(`Cannot send email to ${userEmail}: Domain verification required. Only verified email addresses can receive emails.`);
          }
          
          // For other errors, log but don't throw to allow push notifications to still work
          console.warn('📢 [ORCHESTRATOR] Email failed but continuing with other notifications:', errorMessage);
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
