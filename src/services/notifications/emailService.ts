
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
    try {
      await sendEmail({
        to,
        subject,
        html: body,
        senderName: "SkyRanch - Sistema de Gestión Ganadera",
        organizationName: "SkyRanch"
      });
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }
};

export { emailService, buildEmailTemplate, sendEmail };
export type { EmailData };
