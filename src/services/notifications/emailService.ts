
import { sendEmail, EmailData } from './emailClient';
import { buildEmailTemplate } from './emailTemplates';

// Main email service that orchestrates email sending
const emailService = {
  sendEmail: async (
    to: string, 
    subject: string, 
    body: string, 
    eventDetails?: { title: string; description?: string; eventDate: string }
  ): Promise<boolean> => {
    console.log('📧 [EMAIL SERVICE DEBUG] Starting sendEmail');
    console.log('📧 [EMAIL SERVICE DEBUG] To:', to);
    console.log('📧 [EMAIL SERVICE DEBUG] Subject:', subject);
    console.log('📧 [EMAIL SERVICE DEBUG] Body length:', body.length);
    console.log('📧 [EMAIL SERVICE DEBUG] Event details:', eventDetails);

    try {
      // If we have event details, build HTML template, otherwise use the body as-is
      let emailBody = body;
      
      if (eventDetails) {
        console.log('📧 [EMAIL SERVICE DEBUG] Building HTML template for event details');
        const userName = to.split('@')[0]; // Extract name from email
        const organizationName = "SkyRanch";
        
        // Create a proper event object for the template
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

        console.log('📧 [EMAIL SERVICE DEBUG] Building HTML template for event type:', eventType);
        emailBody = buildEmailTemplate(eventType, eventForTemplate, userName, organizationName);
        console.log('📧 [EMAIL SERVICE DEBUG] HTML template built, length:', emailBody.length);
      }

      console.log('📧 [EMAIL SERVICE DEBUG] Calling sendEmail function...');
      const result = await sendEmail({
        to,
        subject,
        html: emailBody,
        senderName: "SkyRanch - Sistema de Gestión Ganadera",
        organizationName: "SkyRanch"
      });
      console.log('📧 [EMAIL SERVICE DEBUG] sendEmail result:', result);
      console.log('✅ [EMAIL SERVICE DEBUG] Email sent successfully');
      return true;
    } catch (error) {
      console.error('❌ [EMAIL SERVICE DEBUG] Failed to send email:', error);
      console.error('❌ [EMAIL SERVICE DEBUG] Error details:', {
        message: error.message,
        stack: error.stack,
        to,
        subject
      });
      return false;
    }
  }
};

export { emailService, buildEmailTemplate, sendEmail };
export type { EmailData };
