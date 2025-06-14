
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
    console.log('📢 [NOTIFICATION ORCHESTRATOR DEBUG] ===== STARTING NOTIFICATION PROCESS =====');
    console.log('📢 [NOTIFICATION ORCHESTRATOR DEBUG] Parameters:', {
      userId,
      userEmail,
      title,
      message,
      hasEventDetails: !!eventDetails,
      eventDetails
    });
    
    try {
      // Step 1: Get user preferences
      console.log('📢 [NOTIFICATION ORCHESTRATOR DEBUG] Step 1: Getting user preferences...');
      const preferences = await userNotificationService.getUserPreferences(userId);
      console.log('📢 [NOTIFICATION ORCHESTRATOR DEBUG] Retrieved preferences:', preferences);
      
      // Step 2: Check if email should be sent
      console.log('📢 [NOTIFICATION ORCHESTRATOR DEBUG] Step 2: Checking email conditions...');
      console.log('📢 [NOTIFICATION ORCHESTRATOR DEBUG] Email enabled:', preferences.email);
      console.log('📢 [NOTIFICATION ORCHESTRATOR DEBUG] User email available:', !!userEmail);
      console.log('📢 [NOTIFICATION ORCHESTRATOR DEBUG] User email value:', userEmail);
      
      if (preferences.email && userEmail) {
        console.log('📢 [NOTIFICATION ORCHESTRATOR DEBUG] ✅ Email conditions met - proceeding with email...');
        
        try {
          console.log('📢 [NOTIFICATION ORCHESTRATOR DEBUG] Step 3: Calling sendEmailNotification...');
          const emailSuccess = await emailNotificationService.sendEmailNotification(userEmail, title, message, eventDetails);
          console.log('📢 [NOTIFICATION ORCHESTRATOR DEBUG] ✅ Email notification completed successfully:', emailSuccess);
          
          await userNotificationService.logNotification({
            userId,
            type: 'email',
            status: 'sent',
            message: `${title}: ${message}`,
            sentAt: new Date().toISOString()
          });
          
        } catch (emailError) {
          console.error('❌ [NOTIFICATION ORCHESTRATOR DEBUG] EMAIL FAILED with error:', emailError);
          
          await userNotificationService.logNotification({
            userId,
            type: 'email',
            status: 'failed',
            message: `${title}: ${message}`,
            error: `Email error: ${emailError.message}`
          });
          
          console.warn('📢 [NOTIFICATION ORCHESTRATOR DEBUG] ⚠️ Email failed but continuing with other methods');
        }
      } else {
        console.log('📢 [NOTIFICATION ORCHESTRATOR DEBUG] ❌ Email conditions NOT met');
      }

      // Step 4: Send push notification
      if (preferences.push) {
        console.log('📢 [NOTIFICATION ORCHESTRATOR DEBUG] Step 4: Sending push notification...');
        try {
          const pushSuccess = await pushNotificationService.sendPushNotification(userId, title, message);
          console.log('📢 [NOTIFICATION ORCHESTRATOR DEBUG] Push notification result:', pushSuccess);
          
          await userNotificationService.logNotification({
            userId,
            type: 'push',
            status: pushSuccess ? 'sent' : 'failed',
            message: `${title}: ${message}`,
            sentAt: pushSuccess ? new Date().toISOString() : undefined,
            error: pushSuccess ? undefined : 'Failed to send push notification'
          });
        } catch (pushError) {
          console.error('❌ [NOTIFICATION ORCHESTRATOR DEBUG] Push notification failed:', pushError);
          await userNotificationService.logNotification({
            userId,
            type: 'push',
            status: 'failed',
            message: `${title}: ${message}`,
            error: `Push error: ${pushError.message}`
          });
        }
      } else {
        console.log('📢 [NOTIFICATION ORCHESTRATOR DEBUG] Push notification skipped - user preference disabled');
      }

      console.log('📢 [NOTIFICATION ORCHESTRATOR DEBUG] ===== NOTIFICATION PROCESS COMPLETED =====');
    } catch (error) {
      console.error('❌ [NOTIFICATION ORCHESTRATOR DEBUG] ===== CRITICAL ERROR IN NOTIFICATION PROCESS =====');
      console.error('❌ [NOTIFICATION ORCHESTRATOR DEBUG] Critical error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        userId,
        userEmail,
        title
      });
      
      throw new Error(`Notification process failed: ${error.message}`);
    }
  }
}

export const notificationOrchestrator = new NotificationOrchestrator();
