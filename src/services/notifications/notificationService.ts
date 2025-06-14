
import { emailService, buildEmailTemplate } from './emailService';
import { pushService } from './pushService';
import { preferencesService } from './preferencesService';
import { loggingService } from './loggingService';
import { NotificationPreferences, NotificationTemplate, NotificationLog } from './interfaces';

class NotificationService {
  // Send email notification with proper HTML template
  async sendEmailNotification(
    to: string, 
    subject: string, 
    body: string, 
    eventDetails?: { title: string; description?: string; eventDate: string }
  ): Promise<boolean> {
    console.log('📧 [EMAIL SERVICE DEBUG] Starting sendEmailNotification');
    console.log('📧 [EMAIL SERVICE DEBUG] To:', to);
    console.log('📧 [EMAIL SERVICE DEBUG] Subject:', subject);
    console.log('📧 [EMAIL SERVICE DEBUG] Event details:', eventDetails);

    try {
      // If we have event details, use the HTML template, otherwise use plain text
      if (eventDetails) {
        const userName = to.split('@')[0]; // Extract name from email
        const organizationName = "SkyRanch";
        
        // Create a proper event object for the template
        const eventForTemplate = {
          title: eventDetails.title,
          description: eventDetails.description,
          event_type: 'reminder',
          start_date: eventDetails.eventDate,
          event_date: eventDetails.eventDate,
          location: '',
          veterinarian: ''
        };

        // Determine event type from subject
        let eventType = 'reminder';
        if (subject.includes('actualizado')) {
          eventType = 'updated';
        } else if (subject.includes('creado') || subject.includes('Nuevo')) {
          eventType = 'created';
        } else if (subject.includes('cancelado')) {
          eventType = 'deleted';
        }

        console.log('📧 [EMAIL SERVICE DEBUG] Building HTML template for event type:', eventType);
        const htmlBody = buildEmailTemplate(eventType, eventForTemplate, userName, organizationName);
        
        console.log('📧 [EMAIL SERVICE DEBUG] Calling emailService.sendEmailNotification with HTML template');
        const result = await emailService.sendEmailNotification(to, subject, htmlBody, eventDetails);
        console.log('📧 [EMAIL SERVICE DEBUG] Email service result:', result);
        return result;
      } else {
        console.log('📧 [EMAIL SERVICE DEBUG] Calling emailService.sendEmailNotification with plain text');
        const result = await emailService.sendEmailNotification(to, subject, body, eventDetails);
        console.log('📧 [EMAIL SERVICE DEBUG] Email service result:', result);
        return result;
      }
    } catch (error) {
      console.error('❌ [EMAIL SERVICE DEBUG] Error in sendEmailNotification:', error);
      throw error;
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

  // Send comprehensive notifications based on user preferences with event details and proper HTML template
  async sendNotification(
    userId: string, 
    userEmail: string, 
    title: string, 
    message: string,
    eventDetails?: { title: string; description?: string; eventDate: string }
  ): Promise<void> {
    console.log('📢 [MAIN NOTIFICATION DEBUG] Starting comprehensive notification send for user:', userId);
    console.log('📢 [MAIN NOTIFICATION DEBUG] User email:', userEmail);
    console.log('📢 [MAIN NOTIFICATION DEBUG] Title:', title);
    console.log('📢 [MAIN NOTIFICATION DEBUG] Message:', message);
    console.log('📢 [MAIN NOTIFICATION DEBUG] Event details:', eventDetails);
    
    try {
      const preferences = await this.getUserPreferences(userId);
      console.log('📢 [MAIN NOTIFICATION DEBUG] User preferences:', preferences);
      
      // Send email notification with proper HTML template
      if (preferences.email && userEmail) {
        console.log('📢 [MAIN NOTIFICATION DEBUG] Sending email notification...');
        try {
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
          console.error('❌ [MAIN NOTIFICATION DEBUG] Email notification failed:', emailError);
          await this.logNotification({
            userId,
            type: 'email',
            status: 'failed',
            message: `${title}: ${message}`,
            error: `Email error: ${emailError.message}`
          });
        }
      } else {
        console.log('📢 [MAIN NOTIFICATION DEBUG] Email notification skipped - preferences:', { email: preferences.email, userEmail: !!userEmail });
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
      console.error('❌ [MAIN NOTIFICATION DEBUG] Error in sendNotification:', error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;

// Re-export interfaces for backward compatibility
export type { NotificationPreferences, NotificationTemplate, NotificationLog };
