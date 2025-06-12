
import { emailService } from './emailService';
import { pushService } from './pushService';
import { preferencesService } from './preferencesService';
import { loggingService } from './loggingService';
import { NotificationPreferences, NotificationTemplate, NotificationLog } from './interfaces';

class NotificationService {
  // Send email notification
  async sendEmailNotification(to: string, subject: string, body: string): Promise<boolean> {
    return emailService.sendEmailNotification(to, subject, body);
  }

  // Send push notification
  async sendPushNotification(userId: string, title: string, body: string): Promise<boolean> {
    return pushService.sendPushNotification(userId, title, body);
  }

  // Get user notification preferences
  async getUserPreferences(userId: string): Promise<NotificationPreferences> {
    return preferencesService.getUserPreferences(userId);
  }

  // Save user notification preferences
  async saveUserPreferences(preferences: NotificationPreferences): Promise<boolean> {
    return preferencesService.saveUserPreferences(preferences);
  }

  // Log notification delivery
  async logNotification(log: Omit<NotificationLog, 'id' | 'createdAt'>): Promise<void> {
    return loggingService.logNotification(log);
  }

  // Send comprehensive notifications based on user preferences
  async sendNotification(userId: string, userEmail: string, title: string, message: string): Promise<void> {
    console.log('📢 Starting comprehensive notification send for user:', userId);
    
    const preferences = await this.getUserPreferences(userId);
    
    // Send email notification
    if (preferences.email && userEmail) {
      const emailSuccess = await this.sendEmailNotification(userEmail, title, message);
      await this.logNotification({
        userId,
        type: 'email',
        status: emailSuccess ? 'sent' : 'failed',
        message: `${title}: ${message}`,
        sentAt: emailSuccess ? new Date().toISOString() : undefined,
        error: emailSuccess ? undefined : 'Failed to send email'
      });
    }

    // Send push notification
    if (preferences.push) {
      const pushSuccess = await this.sendPushNotification(userId, title, message);
      await this.logNotification({
        userId,
        type: 'push',
        status: pushSuccess ? 'sent' : 'failed',
        message: `${title}: ${message}`,
        sentAt: pushSuccess ? new Date().toISOString() : undefined,
        error: pushSuccess ? undefined : 'Failed to send push notification'
      });
    }

    console.log('✅ Comprehensive notification process completed for user:', userId);
  }
}

export const notificationService = new NotificationService();
export default notificationService;

// Re-export interfaces for backward compatibility
export type { NotificationPreferences, NotificationTemplate, NotificationLog };
