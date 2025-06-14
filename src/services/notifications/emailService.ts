
import { sendEmail, EmailData } from './emailClient';
import { buildEmailTemplate } from './emailTemplates';

// Simplified email service focused on core functionality
const emailService = {
  sendEmail: async (
    to: string, 
    subject: string, 
    body: string, 
    eventDetails?: { title: string; description?: string; eventDate: string }
  ): Promise<boolean> => {
    console.log('📧 [EMAIL SERVICE] Starting emailService.sendEmail');
    console.log('📧 [EMAIL SERVICE] Parameters:', {
      to,
      subject,
      bodyLength: body.length,
      hasEventDetails: !!eventDetails
    });

    if (!to || !subject) {
      throw new Error('Missing required parameters: to and subject are required');
    }

    try {
      let emailBody = body;
      
      // Build HTML template if we have event details
      if (eventDetails) {
        console.log('📧 [EMAIL SERVICE] Building HTML template for event details');
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

        // Determine event type from subject
        let eventType = 'reminder';
        if (subject.includes('actualizado')) {
          eventType = 'updated';
        } else if (subject.includes('creado') || subject.includes('Nuevo')) {
          eventType = 'created';
        } else if (subject.includes('cancelado')) {
          eventType = 'deleted';
        }

        emailBody = buildEmailTemplate(eventType, eventForTemplate, userName, organizationName);
        console.log('📧 [EMAIL SERVICE] HTML template built, length:', emailBody.length);
      }

      console.log('📧 [EMAIL SERVICE] Calling sendEmail...');
      const result = await sendEmail({
        to: to.trim(),
        subject: subject.trim(),
        html: emailBody,
        senderName: "SkyRanch - Sistema de Gestión Ganadera",
        organizationName: "SkyRanch"
      });
      
      console.log('📧 [EMAIL SERVICE] sendEmail result:', result);
      
      if (result && (result.data?.id || result.id)) {
        console.log('✅ [EMAIL SERVICE] Email sent successfully');
        return true;
      }

      throw new Error('Email service returned invalid response');
      
    } catch (error) {
      console.error('❌ [EMAIL SERVICE] Failed to send email:', error);
      throw new Error(`EmailService failed: ${error.message}`);
    }
  },

  testEmail: async (to: string): Promise<boolean> => {
    console.log('🧪 [EMAIL SERVICE] Testing email functionality...');
    try {
      const result = await emailService.sendEmail(
        to,
        'Test Email - SkyRanch',
        '<h1>Test Email</h1><p>This is a test email to verify the email system is working.</p>'
      );
      console.log('🧪 [EMAIL SERVICE] Test email result:', result);
      return result;
    } catch (error) {
      console.error('🧪 [EMAIL SERVICE] Test email failed:', error);
      throw error;
    }
  }
};

export { emailService, buildEmailTemplate, sendEmail };
export type { EmailData };
