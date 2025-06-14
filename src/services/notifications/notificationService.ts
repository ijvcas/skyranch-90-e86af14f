import { emailService } from './emailService';
import { pushService } from './pushService';
import { preferencesService } from './preferencesService';
import { loggingService } from './loggingService';
import { NotificationPreferences, NotificationTemplate, NotificationLog } from './interfaces';

class NotificationService {
  // Send email notification using the email service with enhanced error handling
  async sendEmailNotification(
    to: string, 
    subject: string, 
    body: string, 
    eventDetails?: { title: string; description?: string; eventDate: string }
  ): Promise<boolean> {
    console.log('📧 [NOTIFICATION SERVICE DEBUG] Starting sendEmailNotification');
    console.log('📧 [NOTIFICATION SERVICE DEBUG] Parameters:', {
      to,
      subject,
      bodyLength: body.length,
      hasEventDetails: !!eventDetails
    });

    try {
      console.log('📧 [NOTIFICATION SERVICE DEBUG] Calling emailService.sendEmail');
      const result = await emailService.sendEmail(to, subject, body, eventDetails);
      console.log('📧 [NOTIFICATION SERVICE DEBUG] Email service result:', result);
      return result;
    } catch (error) {
      console.error('❌ [NOTIFICATION SERVICE DEBUG] Error in sendEmailNotification:', error);
      console.error('❌ [NOTIFICATION SERVICE DEBUG] Error stack:', error.stack);
      console.error('❌ [NOTIFICATION SERVICE DEBUG] Full error context:', {
        to,
        subject,
        errorName: error.name,
        errorMessage: error.message
      });
      
      // Don't return false - throw the error so it can be caught and logged properly upstream
      throw new Error(`NotificationService email failed: ${error.message}`);
    }
  }

  // Send push notification
  async sendPushNotification(userId: string, title: string, body: string): Promise<boolean> {
    console.log('📱 [PUSH SERVICE DEBUG] Sending push notification to user:', userId);
    try {
      const result = await pushService.sendPushNotification(userId, title, body);
      console.log('📱 [PUSH SERVICE DEBUG] Push notification result:', result);
      return result;
    } catch (error) {
      console.error('❌ [PUSH SERVICE DEBUG] Error sending push notification:', error);
      return false;
    }
  }

  // Get user notification preferences
  async getUserPreferences(userId: string): Promise<NotificationPreferences> {
    console.log('⚙️ [PREFERENCES DEBUG] Getting preferences for user:', userId);
    try {
      const preferences = await preferencesService.getUserPreferences(userId);
      console.log('⚙️ [PREFERENCES DEBUG] User preferences:', preferences);
      return preferences;
    } catch (error) {
      console.error('❌ [PREFERENCES DEBUG] Error getting preferences:', error);
      // Return default preferences if error
      return {
        userId,
        email: true,
        push: true,
        inApp: true,
      };
    }
  }

  // Save user notification preferences
  async saveUserPreferences(preferences: NotificationPreferences): Promise<boolean> {
    return preferencesService.saveUserPreferences(preferences);
  }

  // Log notification delivery
  async logNotification(log: Omit<NotificationLog, 'id' | 'createdAt'>): Promise<void> {
    return loggingService.logNotification(log);
  }

  // Send comprehensive notifications based on user preferences with event details
  async sendNotification(
    userId: string, 
    userEmail: string, 
    title: string, 
    message: string,
    eventDetails?: { title: string; description?: string; eventDate: string }
  ): Promise<void> {
    console.log('📢 [MAIN NOTIFICATION DEBUG] Starting comprehensive notification send for user:', userId);
    console.log('📢 [MAIN NOTIFICATION DEBUG] Parameters:', {
      userId,
      userEmail,
      title,
      message,
      hasEventDetails: !!eventDetails
    });
    
    try {
      const preferences = await this.getUserPreferences(userId);
      console.log('📢 [MAIN NOTIFICATION DEBUG] User preferences:', preferences);
      
      // Send email notification
      if (preferences.email && userEmail) {
        console.log('📢 [MAIN NOTIFICATION DEBUG] Attempting email notification...');
        try {
          console.log('📢 [MAIN NOTIFICATION DEBUG] About to call this.sendEmailNotification');
          const emailSuccess = await this.sendEmailNotification(userEmail, title, message, eventDetails);
          console.log('📢 [MAIN NOTIFICATION DEBUG] Email notification result:', emailSuccess);
          
          await this.logNotification({
            userId,
            type: 'email',
            status: emailSuccess ? 'sent' : 'failed',
            message: `${title}: ${message}`,
            sentAt: emailSuccess ? new Date().toISOString() : undefined,
            error: emailSuccess ? undefined : 'Failed to send email'
          });
        } catch (emailError) {
          console.error('❌ [MAIN NOTIFICATION DEBUG] Email notification failed with error:', emailError);
          console.error('❌ [MAIN NOTIFICATION DEBUG] Email error stack:', emailError.stack);
          console.error('❌ [MAIN NOTIFICATION DEBUG] Email error details:', {
            name: emailError.name,
            message: emailError.message,
            cause: emailError.cause
          });
          
          await this.logNotification({
            userId,
            type: 'email',
            status: 'failed',
            message: `${title}: ${message}`,
            error: `Email error: ${emailError.message}`
          });
          
          // Don't fail the whole notification process, just log and continue
          console.warn('📢 [MAIN NOTIFICATION DEBUG] Continuing with other notification methods despite email failure');
        }
      } else {
        console.log('📢 [MAIN NOTIFICATION DEBUG] Email notification skipped - preferences:', { 
          email: preferences.email, 
          userEmail: !!userEmail 
        });
      }

      // Send push notification
      if (preferences.push) {
        console.log('📢 [MAIN NOTIFICATION DEBUG] Sending push notification...');
        try {
          const pushSuccess = await this.sendPushNotification(userId, title, message);
          console.log('📢 [MAIN NOTIFICATION DEBUG] Push notification result:', pushSuccess);
          
          await this.logNotification({
            userId,
            type: 'push',
            status: pushSuccess ? 'sent' : 'failed',
            message: `${title}: ${message}`,
            sentAt: pushSuccess ? new Date().toISOString() : undefined,
            error: pushSuccess ? undefined : 'Failed to send push notification'
          });
        } catch (pushError) {
          console.error('❌ [MAIN NOTIFICATION DEBUG] Push notification failed:', pushError);
          await this.logNotification({
            userId,
            type: 'push',
            status: 'failed',
            message: `${title}: ${message}`,
            error: `Push error: ${pushError.message}`
          });
        }
      } else {
        console.log('📢 [MAIN NOTIFICATION DEBUG] Push notification skipped - user preference disabled');
      }

      console.log('✅ [MAIN NOTIFICATION DEBUG] Comprehensive notification process completed for user:', userId);
    } catch (error) {
      console.error('❌ [MAIN NOTIFICATION DEBUG] Critical error in sendNotification:', error);
      console.error('❌ [MAIN NOTIFICATION DEBUG] sendNotification error stack:', error.stack);
      throw error;
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;

// Re-export interfaces for backward compatibility
export type { NotificationPreferences, NotificationTemplate, NotificationLog };
