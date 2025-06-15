
import { notificationEmailService } from '../integration/NotificationEmailService';
import { emailEngine } from '../core/EmailEngine';
import { EmailResult, EventDetails } from '../interfaces/EmailTypes';
import { emailLogger } from '../core/EmailLogger';

export class EmailServiceV2 {
  async sendEmail(
    to: string, 
    subject: string, 
    body: string, 
    eventDetails?: EventDetails
  ): Promise<boolean> {
    emailLogger.info('EmailServiceV2.sendEmail called', { to, subject });

    if (!to || !subject) {
      throw new Error('Missing required parameters: to and subject');
    }

    try {
      let result: EmailResult;

      if (eventDetails) {
        // This is a calendar event email
        emailLogger.debug('Sending calendar event email');
        
        const userName = to.split('@')[0];
        
        // Determine event type from subject
        let eventType: 'created' | 'updated' | 'deleted' | 'reminder' = 'reminder';
        if (subject.includes('actualizado')) {
          eventType = 'updated';
        } else if (subject.includes('creado') || subject.includes('Nuevo')) {
          eventType = 'created';
        } else if (subject.includes('cancelado')) {
          eventType = 'deleted';
        }

        result = await notificationEmailService.sendEventNotification(
          to,
          eventType,
          eventDetails,
          userName
        );
      } else {
        // This is a custom email with HTML body
        emailLogger.debug('Sending custom email');
        
        result = await emailEngine.sendCustomEmail({
          to: { email: to },
          content: {
            subject,
            html: body
          },
          metadata: {
            senderName: "SkyRanch - Sistema de Gestión Ganadera",
            organizationName: "SkyRanch"
          }
        });
      }

      if (result.success) {
        emailLogger.info('Email sent successfully');
        return true;
      } else {
        emailLogger.error('Email sending failed', result.error);
        throw new Error(result.error || 'Email sending failed');
      }
      
    } catch (error) {
      emailLogger.error('EmailServiceV2.sendEmail failed', error);
      throw error;
    }
  }

  async testEmail(to: string): Promise<boolean> {
    emailLogger.info('EmailServiceV2.testEmail called', { to });
    
    try {
      const result = await notificationEmailService.sendTestNotification(to);
      
      if (result.success) {
        emailLogger.info('Test email sent successfully');
        return true;
      } else {
        emailLogger.error('Test email sending failed', result.error);
        throw new Error(result.error || 'Test email sending failed');
      }
    } catch (error) {
      emailLogger.error('EmailServiceV2.testEmail failed', error);
      throw error;
    }
  }

  // Health check method
  async healthCheck() {
    return await emailEngine.healthCheck();
  }

  // Get logs for debugging
  getLogs(level?: 'info' | 'warn' | 'error' | 'debug') {
    return emailEngine.getLogger().getLogs(level);
  }
}

export const emailServiceV2 = new EmailServiceV2();
