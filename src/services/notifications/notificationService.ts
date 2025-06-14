
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
      console.log('📧 [NOTIFICATION SERVICE DEBUG] About to call emailService.sendEmail');
      const result = await emailService.sendEmail(to, subject, body, eventDetails);
      console.log('📧 [NOTIFICATION SERVICE DEBUG] Email service returned:', result);
      
      if (result === true) {
        console.log('✅ [NOTIFICATION SERVICE DEBUG] Email sent successfully');
        return true;
      } else {
        console.error('❌ [NOTIFICATION SERVICE DEBUG] Email service returned false/falsy result:', result);
        throw new Error('Email service returned false - email not sent');
      }
    } catch (error) {
      console.error('❌ [NOTIFICATION SERVICE DEBUG] Error in sendEmailNotification:', error);
      console.error('❌ [NOTIFICATION SERVICE DEBUG] Error stack:', error.stack);
      console.error('❌ [NOTIFICATION SERVICE DEBUG] Full error context:', {
        to,
        subject,
        errorName: error.name,
        errorMessage: error.message
      });
      
      // Re-throw with more context
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
      const defaultPrefs = {
        userId,
        email: true,
        push: true,
        inApp: true,
      };
      console.log('⚙️ [PREFERENCES DEBUG] Returning default preferences:', defaultPrefs);
      return defaultPrefs;
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
    console.log('📢 [MAIN NOTIFICATION DEBUG] ===== STARTING NOTIFICATION PROCESS =====');
    console.log('📢 [MAIN NOTIFICATION DEBUG] Parameters:', {
      userId,
      userEmail,
      title,
      message,
      hasEventDetails: !!eventDetails,
      eventDetails
    });
    
    try {
      // Step 1: Get user preferences
      console.log('📢 [MAIN NOTIFICATION DEBUG] Step 1: Getting user preferences...');
      const preferences = await this.getUserPreferences(userId);
      console.log('📢 [MAIN NOTIFICATION DEBUG] Retrieved preferences:', preferences);
      
      // Step 2: Check if email should be sent
      console.log('📢 [MAIN NOTIFICATION DEBUG] Step 2: Checking email conditions...');
      console.log('📢 [MAIN NOTIFICATION DEBUG] Email enabled:', preferences.email);
      console.log('📢 [MAIN NOTIFICATION DEBUG] User email available:', !!userEmail);
      console.log('📢 [MAIN NOTIFICATION DEBUG] User email value:', userEmail);
      
      if (preferences.email && userEmail) {
        console.log('📢 [MAIN NOTIFICATION DEBUG] ✅ Email conditions met - proceeding with email...');
        
        try {
          console.log('📢 [MAIN NOTIFICATION DEBUG] Step 3: Calling sendEmailNotification...');
          console.log('📢 [MAIN NOTIFICATION DEBUG] Email params:', {
            userEmail,
            title,
            message,
            eventDetails
          });
          
          const emailSuccess = await this.sendEmailNotification(userEmail, title, message, eventDetails);
          console.log('📢 [MAIN NOTIFICATION DEBUG] ✅ Email notification completed successfully:', emailSuccess);
          
          // Log success
          await this.logNotification({
            userId,
            type: 'email',
            status: 'sent',
            message: `${title}: ${message}`,
            sentAt: new Date().toISOString()
          });
          
        } catch (emailError) {
          console.error('❌ [MAIN NOTIFICATION DEBUG] EMAIL FAILED with error:', emailError);
          console.error('❌ [MAIN NOTIFICATION DEBUG] Email error type:', typeof emailError);
          console.error('❌ [MAIN NOTIFICATION DEBUG] Email error name:', emailError.name);
          console.error('❌ [MAIN NOTIFICATION DEBUG] Email error message:', emailError.message);
          console.error('❌ [MAIN NOTIFICATION DEBUG] Email error stack:', emailError.stack);
          
          // Log failure
          await this.logNotification({
            userId,
            type: 'email',
            status: 'failed',
            message: `${title}: ${message}`,
            error: `Email error: ${emailError.message}`
          });
          
          // Don't throw - continue with other notification methods
          console.warn('📢 [MAIN NOTIFICATION DEBUG] ⚠️ Email failed but continuing with other methods');
        }
      } else {
        console.log('📢 [MAIN NOTIFICATION DEBUG] ❌ Email conditions NOT met:');
        console.log('📢 [MAIN NOTIFICATION DEBUG] - Email preference enabled:', preferences.email);
        console.log('📢 [MAIN NOTIFICATION DEBUG] - User email provided:', !!userEmail);
        console.log('📢 [MAIN NOTIFICATION DEBUG] - User email value:', userEmail);
      }

      // Step 4: Send push notification
      if (preferences.push) {
        console.log('📢 [MAIN NOTIFICATION DEBUG] Step 4: Sending push notification...');
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

      console.log('📢 [MAIN NOTIFICATION DEBUG] ===== NOTIFICATION PROCESS COMPLETED =====');
    } catch (error) {
      console.error('❌ [MAIN NOTIFICATION DEBUG] ===== CRITICAL ERROR IN NOTIFICATION PROCESS =====');
      console.error('❌ [MAIN NOTIFICATION DEBUG] Critical error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        userId,
        userEmail,
        title
      });
      
      // Still throw the error so calling code knows something went wrong
      throw new Error(`Notification process failed: ${error.message}`);
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;

// Re-export interfaces for backward compatibility
export type { NotificationPreferences, NotificationTemplate, NotificationLog };
