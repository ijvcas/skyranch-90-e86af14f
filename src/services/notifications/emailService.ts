
import { sendEmail, EmailData } from './emailClient';
import { buildEmailTemplate } from './emailTemplates';

// Main email service that orchestrates email sending
const emailService = {
  sendEmailNotification: async (
    to: string, 
    subject: string, 
    body: string, 
    eventDetails?: { title: string; description?: string; eventDate: string }
  ): Promise<boolean> => {
    console.log('📧 [EMAIL SERVICE CLIENT DEBUG] Starting sendEmailNotification');
    console.log('📧 [EMAIL SERVICE CLIENT DEBUG] To:', to);
    console.log('📧 [EMAIL SERVICE CLIENT DEBUG] Subject:', subject);
    console.log('📧 [EMAIL SERVICE CLIENT DEBUG] Body length:', body.length);
    console.log('📧 [EMAIL SERVICE CLIENT DEBUG] Event details:', eventDetails);

    try {
      console.log('📧 [EMAIL SERVICE CLIENT DEBUG] Calling sendEmail function...');
      const result = await sendEmail({
        to,
        subject,
        html: body,
        senderName: "SkyRanch - Sistema de Gestión Ganadera",
        organizationName: "SkyRanch"
      });
      console.log('📧 [EMAIL SERVICE CLIENT DEBUG] sendEmail result:', result);
      console.log('✅ [EMAIL SERVICE CLIENT DEBUG] Email sent successfully');
      return true;
    } catch (error) {
      console.error('❌ [EMAIL SERVICE CLIENT DEBUG] Failed to send email:', error);
      console.error('❌ [EMAIL SERVICE CLIENT DEBUG] Error details:', {
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
