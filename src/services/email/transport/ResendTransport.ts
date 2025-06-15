
import { EmailRequest, EmailResult, EmailTransport } from '../interfaces/EmailTypes';
import { EmailErrorHandler } from '../core/EmailErrorHandler';
import { emailLogger } from '../core/EmailLogger';
import { supabase } from '@/integrations/supabase/client';

export class ResendTransport implements EmailTransport {
  async send(request: EmailRequest): Promise<EmailResult> {
    emailLogger.info('Sending email via Resend transport', {
      to: Array.isArray(request.to) ? request.to.map(t => t.email) : request.to.email,
      subject: request.content.subject
    });

    try {
      // Ensure user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Authentication required to send emails');
      }

      // Prepare recipients
      const recipients = Array.isArray(request.to) ? request.to : [request.to];
      const toEmails = recipients.map(r => r.email);

      // Prepare payload for edge function
      const payload = {
        to: toEmails[0], // For now, send to first recipient (can extend for multiple)
        subject: request.content.subject,
        html: request.content.html,
        senderName: request.metadata?.senderName || "SkyRanch - Sistema de Gestión Ganadera",
        organizationName: request.metadata?.organizationName || "SkyRanch"
      };

      emailLogger.debug('Calling send-email edge function', payload);

      // Call the edge function
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: payload
      });

      emailLogger.debug('Edge function response', { data, error });

      if (error) {
        emailLogger.error('Edge function error', error);
        const emailError = EmailErrorHandler.handleResendError(error);
        return {
          success: false,
          error: emailError.message,
          details: emailError
        };
      }

      if (!data) {
        throw new Error('No response data from email service');
      }

      // Check for specific error types returned by the edge function
      if (data.error) {
        emailLogger.error('Email service error', data);
        
        const emailError = EmailErrorHandler.handleResendError({
          message: data.message || 'Email service error'
        });
        
        return {
          success: false,
          error: emailError.message,
          details: emailError
        };
      }

      emailLogger.info('Email sent successfully', { messageId: data.id });
      
      return {
        success: true,
        messageId: data.id,
        details: data
      };
      
    } catch (error) {
      emailLogger.error('Transport error', error);
      const emailError = EmailErrorHandler.categorizeError(error);
      
      return {
        success: false,
        error: emailError.message,
        details: emailError
      };
    }
  }
}
