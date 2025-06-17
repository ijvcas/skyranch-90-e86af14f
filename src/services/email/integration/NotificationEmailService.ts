
import { emailEngine } from '../core/EmailEngine';
import { EmailResult, EventDetails } from '../interfaces/EmailTypes';
import { CalendarEventTemplate } from '../templates/CalendarEventTemplate';
import { TestEmailTemplate } from '../templates/TestEmailTemplate';
import { emailLogger } from '../core/EmailLogger';

export class NotificationEmailService {
  private calendarTemplate: CalendarEventTemplate;
  private testTemplate: TestEmailTemplate;

  constructor() {
    this.calendarTemplate = new CalendarEventTemplate();
    this.testTemplate = new TestEmailTemplate();
  }

  async sendEventNotification(
    to: string,
    eventType: 'created' | 'updated' | 'deleted' | 'reminder',
    eventDetails: EventDetails,
    userName?: string
  ): Promise<EmailResult> {
    emailLogger.info('📅 [NOTIFICATION EMAIL] sendEventNotification called', {
      to,
      eventType,
      eventTitle: eventDetails.title,
      userName
    });

    console.log('🔥 [DEBUG] sendEventNotification parameters:', {
      to,
      eventType,
      eventDetails,
      userName
    });

    try {
      console.log('📧 [DEBUG] About to send calendar event email:', {
        to,
        eventType,
        eventTitle: eventDetails.title,
        eventDate: eventDetails.eventDate
      });

      // Fix: Use proper interface for calendar template
      const emailContent = this.calendarTemplate.render({
        eventType,
        eventDetails,
        userName: userName || to.split('@')[0]
      });

      console.log('📧 [DEBUG] Email content generated:', {
        subject: emailContent.subject,
        htmlLength: emailContent.html.length
      });

      const request = {
        to: { email: to },
        content: emailContent,
        metadata: {
          senderName: "SkyRanch - Sistema de Gestión Ganadera",
          organizationName: "SkyRanch",
          tags: [
            { name: "category", value: "calendar_event" },
            { name: "event_type", value: eventType },
            { name: "recipient_domain", value: to.split('@')[1] }
          ]
        }
      };

      console.log('📧 [DEBUG] Calling emailEngine.sendCustomEmail...');
      const result = await emailEngine.sendCustomEmail(request);
      console.log('📧 [DEBUG] Email engine result:', result);

      emailLogger.info('✅ [NOTIFICATION EMAIL] Event notification sent successfully', {
        messageId: result.messageId,
        recipient: to
      });

      return result;
    } catch (error) {
      console.error('❌ [DEBUG] Error in sendEventNotification:', error);
      emailLogger.error('❌ [NOTIFICATION EMAIL] sendEventNotification failed', {
        errorMessage: error.message,
        errorName: error.name,
        recipient: to
      });
      throw error;
    }
  }

  async sendTestNotification(to: string): Promise<EmailResult> {
    emailLogger.info('🧪 [NOTIFICATION EMAIL] sendTestNotification called', { to });

    try {
      console.log('📧 [DEBUG] About to send test email to:', to);

      // Fix: Use proper interface for test template
      const emailContent = this.testTemplate.render({ recipientEmail: to });

      console.log('📧 [DEBUG] Test email content generated:', {
        subject: emailContent.subject,
        htmlLength: emailContent.html.length
      });

      const request = {
        to: { email: to },
        content: emailContent,
        metadata: {
          senderName: "SkyRanch - Sistema de Gestión Ganadera",
          organizationName: "SkyRanch",
          tags: [
            { name: "category", value: "test_email" },
            { name: "recipient_domain", value: to.split('@')[1] }
          ]
        }
      };

      console.log('📧 [DEBUG] Calling emailEngine.sendCustomEmail for test...');
      const result = await emailEngine.sendCustomEmail(request);
      console.log('📧 [DEBUG] Test email result:', result);

      emailLogger.info('✅ [NOTIFICATION EMAIL] Test notification sent successfully', {
        messageId: result.messageId,
        recipient: to
      });

      return result;
    } catch (error) {
      console.error('❌ [DEBUG] Error in sendTestNotification:', error);
      emailLogger.error('❌ [NOTIFICATION EMAIL] sendTestNotification failed', {
        errorMessage: error.message,
        errorName: error.name,
        recipient: to
      });
      throw error;
    }
  }
}

export const notificationEmailService = new NotificationEmailService();
