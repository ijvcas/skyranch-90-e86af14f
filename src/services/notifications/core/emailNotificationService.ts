
import { emailService } from '../emailService';
import { loggingService } from '../loggingService';

export class EmailNotificationService {
  async sendEmailNotification(
    to: string, 
    subject: string, 
    body: string, 
    eventDetails?: { title: string; description?: string; eventDate: string }
  ): Promise<boolean> {
    console.log('📧 [EMAIL NOTIFICATION SERVICE DEBUG] Starting sendEmailNotification');
    console.log('📧 [EMAIL NOTIFICATION SERVICE DEBUG] Parameters:', {
      to,
      subject,
      bodyLength: body.length,
      hasEventDetails: !!eventDetails
    });

    try {
      console.log('📧 [EMAIL NOTIFICATION SERVICE DEBUG] About to call emailService.sendEmail');
      const result = await emailService.sendEmail(to, subject, body, eventDetails);
      console.log('📧 [EMAIL NOTIFICATION SERVICE DEBUG] Email service returned:', result);
      
      if (result === true) {
        console.log('✅ [EMAIL NOTIFICATION SERVICE DEBUG] Email sent successfully');
        return true;
      } else {
        console.error('❌ [EMAIL NOTIFICATION SERVICE DEBUG] Email service returned false/falsy result:', result);
        throw new Error('Email service returned false - email not sent');
      }
    } catch (error) {
      console.error('❌ [EMAIL NOTIFICATION SERVICE DEBUG] Error in sendEmailNotification:', error);
      console.error('❌ [EMAIL NOTIFICATION SERVICE DEBUG] Error stack:', error.stack);
      console.error('❌ [EMAIL NOTIFICATION SERVICE DEBUG] Full error context:', {
        to,
        subject,
        errorName: error.name,
        errorMessage: error.message
      });
      
      throw new Error(`EmailNotificationService failed: ${error.message}`);
    }
  }
}

export const emailNotificationService = new EmailNotificationService();
