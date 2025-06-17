
import { pushNotificationService } from './core/pushNotificationService';
import { userNotificationService } from './core/userNotificationService';
import { notificationOrchestrator } from './core/notificationOrchestrator';
import { emailServiceV2 } from '../email/v2/EmailServiceV2';
import { NotificationPreferences, NotificationTemplate, NotificationLog } from './interfaces';

class NotificationService {
  // Delegate to email service V2 directly
  async sendEmailNotification(
    to: string, 
    subject: string, 
    body: string, 
    eventDetails?: { title: string; description?: string; eventDate: string }
  ): Promise<boolean> {
    return emailServiceV2.sendEmail(to, subject, body, eventDetails);
  }

  // Delegate to push notification service
  async sendPushNotification(userId: string, title: string, body: string): Promise<boolean> {
    return pushNotificationService.sendPushNotification(userId, title, body);
  }

  // Delegate to user notification service
  async getUserPreferences(userId: string): Promise<NotificationPreferences> {
    return userNotificationService.getUserPreferences(userId);
  }

  async saveUserPreferences(preferences: NotificationPreferences): Promise<boolean> {
    return userNotificationService.saveUserPreferences(preferences);
  }

  async logNotification(log: Omit<NotificationLog, 'id' | 'createdAt'>): Promise<void> {
    return userNotificationService.logNotification(log);
  }

  // Delegate to notification orchestrator for main notification flow
  async sendNotification(
    userId: string, 
    userEmail: string, 
    title: string, 
    message: string,
    eventDetails?: { title: string; description?: string; eventDate: string }
  ): Promise<void> {
    return notificationOrchestrator.sendNotification(userId, userEmail, title, message, eventDetails);
  }
}

export const notificationService = new NotificationService();
export default notificationService;

// Re-export interfaces for backward compatibility
export type { NotificationPreferences, NotificationTemplate, NotificationLog };
