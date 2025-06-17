
import { EmailRequest, EmailResult, EmailTransport, EmailLog } from '../interfaces/EmailTypes';
import { ResendTransport } from '../transport/ResendTransport';
import { GmailTransport } from '../transport/GmailTransport';
import { emailLogger } from './EmailLogger';

export class EmailEngine {
  private resendTransport: EmailTransport;
  private gmailTransport: EmailTransport;

  constructor() {
    this.resendTransport = new ResendTransport();
    this.gmailTransport = new GmailTransport();
  }

  async sendCustomEmail(request: EmailRequest): Promise<EmailResult> {
    emailLogger.info('🚀 [EMAIL ENGINE] sendCustomEmail called', {
      to: Array.isArray(request.to) ? request.to.map(t => t.email) : request.to.email,
      subject: request.content.subject
    });

    try {
      // Always use Resend transport for reliability
      emailLogger.debug('📤 [EMAIL ENGINE] Using Resend transport for email delivery');
      const result = await this.resendTransport.send(request);
      
      emailLogger.debug('📥 [EMAIL ENGINE] Transport result', result);
      return result;
    } catch (error) {
      emailLogger.error('❌ [EMAIL ENGINE] sendCustomEmail failed', {
        errorMessage: error.message,
        errorName: error.name
      });
      throw error;
    }
  }

  async sendEmailViaGmail(request: EmailRequest): Promise<EmailResult> {
    emailLogger.info('📧 [EMAIL ENGINE] sendEmailViaGmail called', {
      to: Array.isArray(request.to) ? request.to.map(t => t.email) : request.to.email,
      subject: request.content.subject
    });

    try {
      const result = await this.gmailTransport.send(request);
      emailLogger.debug('📧 [EMAIL ENGINE] Gmail transport result', result);
      return result;
    } catch (error) {
      emailLogger.error('❌ [EMAIL ENGINE] sendEmailViaGmail failed', {
        errorMessage: error.message,
        errorName: error.name
      });
      throw error;
    }
  }

  async healthCheck() {
    emailLogger.info('🏥 [EMAIL ENGINE] Health check called');
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      transports: {
        resend: 'available',
        gmail: 'available'
      }
    };
  }

  getLogger() {
    return emailLogger;
  }
}

export const emailEngine = new EmailEngine();
