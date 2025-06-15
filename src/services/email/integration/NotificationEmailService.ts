
import { emailEngine } from '../core/EmailEngine';
import { EventDetails, EmailResult } from '../interfaces/EmailTypes';
import { emailLogger } from '../core/EmailLogger';

export class NotificationEmailService {
  async sendEventNotification(
    userEmail: string,
    eventType: 'created' | 'updated' | 'deleted' | 'reminder',
    eventDetails: EventDetails,
    userName?: string
  ): Promise<EmailResult> {
    emailLogger.info('Sending event notification', { 
      userEmail, 
      eventType, 
      eventTitle: eventDetails.title 
    });

    try {
      return await emailEngine.sendCalendarEventEmail(
        userEmail, 
        eventType, 
        eventDetails, 
        userName
      );
    } catch (error) {
      emailLogger.error('Event notification failed', { userEmail, eventType, error });
      throw error;
    }
  }

  async sendTestNotification(userEmail: string): Promise<EmailResult> {
    emailLogger.info('Sending test notification', { userEmail });

    try {
      return await emailEngine.sendTestEmail(userEmail, 'integration');
    } catch (error) {
      emailLogger.error('Test notification failed', { userEmail, error });
      throw error;
    }
  }
}

export const notificationEmailService = new NotificationEmailService();
