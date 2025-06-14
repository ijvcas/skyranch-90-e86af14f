
import { sendEmail, EmailData } from './emailClient';
import { buildEmailTemplate } from './emailTemplates';

const emailService = {
  sendEmail: async (
    to: string, 
    subject: string, 
    body: string, 
    eventDetails?: { title: string; description?: string; eventDate: string }
  ): Promise<boolean> => {
    console.log('📧 [EMAIL SERVICE] Starting sendEmail');
    console.log('📧 [EMAIL SERVICE] To:', to);
    console.log('📧 [EMAIL SERVICE] Subject:', subject);

    if (!to || !subject) {
      throw new Error('Missing required parameters: to and subject');
    }

    try {
      let emailBody = body;
      
      if (eventDetails) {
        console.log('📧 [EMAIL SERVICE] Building HTML template');
        const userName = to.split('@')[0];
        const organizationName = "SkyRanch";
        
        const eventForTemplate = {
          title: eventDetails.title,
          description: eventDetails.description,
          event_type: 'reminder',
          start_date: eventDetails.eventDate,
          event_date: eventDetails.eventDate,
          location: '',
          veterinarian: ''
        };

        let eventType = 'reminder';
        if (subject.includes('actualizado')) {
          eventType = 'updated';
        } else if (subject.includes('creado') || subject.includes('Nuevo')) {
          eventType = 'created';
        } else if (subject.includes('cancelado')) {
          eventType = 'deleted';
        }

        emailBody = buildEmailTemplate(eventType, eventForTemplate, userName, organizationName);
      }

      console.log('📧 [EMAIL SERVICE] Calling sendEmail...');
      const result = await sendEmail({
        to: to.trim(),
        subject: subject.trim(),
        html: emailBody,
        senderName: "SkyRanch - Sistema de Gestión Ganadera",
        organizationName: "SkyRanch"
      });
      
      console.log('📧 [EMAIL SERVICE] Send result:', result);
      return true;
      
    } catch (error) {
      console.error('❌ [EMAIL SERVICE] Failed:', error);
      throw error;
    }
  },

  testEmail: async (to: string): Promise<boolean> => {
    console.log('🧪 [EMAIL SERVICE] Testing email to:', to);
    try {
      const result = await emailService.sendEmail(
        to,
        'Test Email - SkyRanch',
        '<h1>Test Email</h1><p>This is a test email to verify the email system is working.</p>'
      );
      console.log('🧪 [EMAIL SERVICE] Test result:', result);
      return result;
    } catch (error) {
      console.error('🧪 [EMAIL SERVICE] Test failed:', error);
      throw error;
    }
  }
};

export { emailService, buildEmailTemplate, sendEmail };
export type { EmailData };
