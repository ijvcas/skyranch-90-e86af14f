
import { emailServiceV2 } from '../../email/v2/EmailServiceV2';
import { emailLogger } from '../../email/core/EmailLogger';

export class EmailNotificationService {
  async sendEmailNotification(
    to: string, 
    subject: string, 
    body: string, 
    eventDetails?: { title: string; description?: string; eventDate: string }
  ): Promise<boolean> {
    emailLogger.info('EmailNotificationService.sendEmailNotification called - using v2');

    try {
      return await emailServiceV2.sendEmail(to, subject, body, eventDetails);
    } catch (error) {
      emailLogger.error('EmailNotificationService.sendEmailNotification failed', error);
      throw error;
    }
  }
}

export const emailNotificationService = new EmailNotificationService();
