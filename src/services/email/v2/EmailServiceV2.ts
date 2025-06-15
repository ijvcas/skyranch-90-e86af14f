
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
    emailLogger.info('🔄 [EMAIL SERVICE V2] EmailServiceV2.sendEmail called', { to, subject, hasEventDetails: !!eventDetails });

    if (!to || !subject) {
      const error = 'Missing required parameters: to and subject';
      emailLogger.error('❌ [EMAIL SERVICE V2] Validation failed', { to: !!to, subject: !!subject });
      throw new Error(error);
    }

    try {
      let result: EmailResult;

      if (eventDetails) {
        // This is a calendar event email
        emailLogger.debug('📅 [EMAIL SERVICE V2] Sending calendar event email', { eventDetails });
        
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

        emailLogger.debug('📅 [EMAIL SERVICE V2] Calling notificationEmailService.sendEventNotification', {
          to,
          eventType,
          userName,
          eventDetails
        });

        result = await notificationEmailService.sendEventNotification(
          to,
          eventType,
          eventDetails,
          userName
        );

        emailLogger.debug('📅 [EMAIL SERVICE V2] notificationEmailService.sendEventNotification result', result);
      } else {
        // This is a custom email with HTML body
        emailLogger.debug('🔧 [EMAIL SERVICE V2] Sending custom email', { bodyLength: body?.length });
        
        emailLogger.debug('🔧 [EMAIL SERVICE V2] Calling emailEngine.sendCustomEmail', {
          to,
          subject,
          bodyLength: body?.length
        });

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

        emailLogger.debug('🔧 [EMAIL SERVICE V2] emailEngine.sendCustomEmail result', result);
      }

      if (result.success) {
        emailLogger.info('✅ [EMAIL SERVICE V2] Email sent successfully', { messageId: result.messageId });
        return true;
      } else {
        emailLogger.error('❌ [EMAIL SERVICE V2] Email sending failed', { 
          error: result.error, 
          details: result.details 
        });
        throw new Error(result.error || 'Email sending failed');
      }
      
    } catch (error) {
      emailLogger.error('❌ [EMAIL SERVICE V2] EmailServiceV2.sendEmail failed', {
        errorMessage: error.message,
        errorName: error.name,
        errorStack: error.stack?.substring(0, 500)
      });
      throw error;
    }
  }

  async testEmail(to: string): Promise<boolean> {
    emailLogger.info('🧪 [EMAIL SERVICE V2] EmailServiceV2.testEmail called', { to });
    
    try {
      emailLogger.debug('🧪 [EMAIL SERVICE V2] Calling notificationEmailService.sendTestNotification', { to });
      
      const result = await notificationEmailService.sendTestNotification(to);
      
      emailLogger.debug('🧪 [EMAIL SERVICE V2] notificationEmailService.sendTestNotification result', result);

      if (result.success) {
        emailLogger.info('✅ [EMAIL SERVICE V2] Test email sent successfully', { messageId: result.messageId });
        return true;
      } else {
        emailLogger.error('❌ [EMAIL SERVICE V2] Test email sending failed', { 
          error: result.error, 
          details: result.details 
        });
        throw new Error(result.error || 'Test email sending failed');
      }
    } catch (error) {
      emailLogger.error('❌ [EMAIL SERVICE V2] EmailServiceV2.testEmail failed', {
        errorMessage: error.message,
        errorName: error.name,
        errorStack: error.stack?.substring(0, 500)
      });
      throw error;
    }
  }

  // Health check method
  async healthCheck() {
    emailLogger.info('🏥 [EMAIL SERVICE V2] Health check called');
    return await emailEngine.healthCheck();
  }

  // Get logs for debugging
  getLogs(level?: 'info' | 'warn' | 'error' | 'debug') {
    return emailEngine.getLogger().getLogs(level);
  }
}

export const emailServiceV2 = new EmailServiceV2();
