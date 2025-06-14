
import { emailService } from '../emailService';

export class EmailNotificationService {
  async sendEmailNotification(
    to: string, 
    subject: string, 
    body: string, 
    eventDetails?: { title: string; description?: string; eventDate: string }
  ): Promise<boolean> {
    console.log('📧 [EMAIL NOTIFICATION SERVICE] Sending to:', to);
    console.log('📧 [EMAIL NOTIFICATION SERVICE] Subject:', subject);

    try {
      const result = await emailService.sendEmail(to, subject, body, eventDetails);
      console.log('✅ [EMAIL NOTIFICATION SERVICE] Success');
      return result;
    } catch (error) {
      console.error('❌ [EMAIL NOTIFICATION SERVICE] Error:', error);
      throw error;
    }
  }
}

export const emailNotificationService = new EmailNotificationService();
