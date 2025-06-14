
import { sendEmail, EmailData } from './emailClient';
import { buildEmailTemplate } from './emailTemplates';

// Main email service that orchestrates email sending with enhanced error handling
const emailService = {
  sendEmail: async (
    to: string, 
    subject: string, 
    body: string, 
    eventDetails?: { title: string; description?: string; eventDate: string }
  ): Promise<boolean> => {
    console.log('📧 [EMAIL SERVICE DEBUG] Starting emailService.sendEmail');
    console.log('📧 [EMAIL SERVICE DEBUG] Parameters:', {
      to,
      subject,
      bodyLength: body.length,
      hasEventDetails: !!eventDetails
    });

    // Validate input parameters
    if (!to || !subject) {
      const error = 'Missing required parameters: to and subject are required';
      console.error('📧 [EMAIL SERVICE DEBUG] Parameter validation error:', error);
      throw new Error(error);
    }

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

      console.log('📧 [EMAIL SERVICE DEBUG] About to call emailClient.sendEmail...');
      const result = await sendEmail({
        to: to.trim(),
        subject: subject.trim(),
        html: emailBody,
        senderName: "SkyRanch - Sistema de Gestión Ganadera",
        organizationName: "SkyRanch"
      });
      
      console.log('📧 [EMAIL SERVICE DEBUG] emailClient.sendEmail result:', result);
      
      // Validate the result more thoroughly
      if (!result) {
        console.error('❌ [EMAIL SERVICE DEBUG] Email client returned null/undefined result');
        throw new Error('Email client returned no result');
      }

      if (typeof result === 'object') {
        if (result.error) {
          console.error('❌ [EMAIL SERVICE DEBUG] Email client returned error:', result.error);
          throw new Error(`Email client error: ${result.error}`);
        }
        
        // Check for successful response indicators (Resend typically returns {data: {id: "..."}, error: null})
        if (result.data?.id || result.id) {
          console.log('✅ [EMAIL SERVICE DEBUG] Email sent successfully through emailService');
          return true;
        }
      }

      // If we get here, the result structure is unexpected
      console.error('❌ [EMAIL SERVICE DEBUG] Unexpected result structure:', result);
      throw new Error('Email client returned unexpected response structure');
      
    } catch (error) {
      console.error('❌ [EMAIL SERVICE DEBUG] Failed to send email in emailService:', error);
      console.error('❌ [EMAIL SERVICE DEBUG] Full error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        to,
        subject
      });
      
      // Re-throw the error so it can be caught upstream - don't return false
      throw new Error(`EmailService failed: ${error.message}`);
    }
  },

  // Add a simple test method to verify the email chain works
  testEmail: async (to: string): Promise<boolean> => {
    console.log('🧪 [EMAIL SERVICE DEBUG] Testing email functionality...');
    try {
      const result = await emailService.sendEmail(
        to,
        'Test Email - SkyRanch',
        '<h1>Test Email</h1><p>This is a test email to verify the email system is working.</p>'
      );
      console.log('🧪 [EMAIL SERVICE DEBUG] Test email result:', result);
      return result;
    } catch (error) {
      console.error('🧪 [EMAIL SERVICE DEBUG] Test email failed:', error);
      throw error;
    }
  }
};

export { emailService, buildEmailTemplate, sendEmail };
export type { EmailData };
