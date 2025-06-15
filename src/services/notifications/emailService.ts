import { emailServiceV2 } from '../email/v2/EmailServiceV2';
import { emailLogger } from '../email/core/EmailLogger';

// Backward compatibility wrapper for the new email system
const emailService = {
  sendEmail: async (
    to: string, 
    subject: string, 
    body: string, 
    eventDetails?: { title: string; description?: string; eventDate: string }
  ): Promise<boolean> => {
    emailLogger.info('Legacy emailService.sendEmail called - forwarding to v2');
    
    try {
      return await emailServiceV2.sendEmail(to, subject, body, eventDetails);
    } catch (error) {
      emailLogger.error('Legacy emailService.sendEmail failed', error);
      throw error;
    }
  },

  testEmail: async (to: string): Promise<boolean> => {
    emailLogger.info('Legacy emailService.testEmail called - forwarding to v2');
    
    try {
      return await emailServiceV2.testEmail(to);
    } catch (error) {
      emailLogger.error('Legacy emailService.testEmail failed', error);
      throw error;
    }
  }
};

// Re-export everything for backward compatibility
export { emailService };
export { emailServiceV2 as emailServiceNew };
export type { EmailData } from './emailClient';

// Keep the buildEmailTemplate export for backward compatibility
export { buildEmailTemplate } from './emailTemplates';
export { sendEmail } from './emailClient';
