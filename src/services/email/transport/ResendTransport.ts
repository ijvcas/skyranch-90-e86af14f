
import { EmailRequest, EmailResult, EmailTransport } from '../interfaces/EmailTypes';
import { EmailErrorHandler } from '../core/EmailErrorHandler';
import { emailLogger } from '../core/EmailLogger';
import { supabase } from '@/integrations/supabase/client';

export class ResendTransport implements EmailTransport {
  async send(request: EmailRequest): Promise<EmailResult> {
    emailLogger.info('Sending email via Resend transport V2', {
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
      const toEmail = recipients[0].email; // For now, send to first recipient

      // Prepare payload for the new edge function
      const payload = {
        to: toEmail,
        subject: request.content.subject,
        html: request.content.html,
        senderName: request.metadata?.senderName || "SkyRanch - Sistema de Gestión Ganadera",
        organizationName: request.metadata?.organizationName || "SkyRanch",
        metadata: {
          tags: request.metadata?.tags || [],
          headers: request.metadata?.headers || {}
        }
      };

      emailLogger.debug('Calling send-email-v2 edge function', payload);

      // Call the new edge function
      const { data, error } = await supabase.functions.invoke('send-email-v2', {
        body: payload
      });

      emailLogger.debug('Edge function V2 response', { data, error });

      if (error) {
        emailLogger.error('Edge function V2 error', error);
        const emailError = EmailErrorHandler.handleResendError(error);
        return {
          success: false,
          error: emailError.message,
          details: emailError
        };
      }

      if (!data) {
        throw new Error('No response data from email service V2');
      }

      // Check for specific error types returned by the edge function
      if (data.error) {
        emailLogger.error('Email service V2 error', data);
        
        // Handle domain verification errors specifically
        if (data.error === 'domain_verification_required') {
          const domainError = EmailErrorHandler.createError(
            'DOMAIN_VERIFICATION_REQUIRED',
            'Email domain requires verification. Only verified email addresses can receive emails.',
            data.details,
            false
          );
          
          return {
            success: false,
            error: domainError.message,
            details: domainError
          };
        }

        // Handle rate limiting
        if (data.error === 'rate_limited') {
          const rateError = EmailErrorHandler.createError(
            'RATE_LIMITED',
            'Rate limit exceeded, please try again later',
            data.details,
            true
          );
          
          return {
            success: false,
            error: rateError.message,
            details: rateError
          };
        }

        // Handle API key issues
        if (data.error === 'invalid_api_key') {
          const apiError = EmailErrorHandler.createError(
            'INVALID_API_KEY',
            'Invalid or missing Resend API key',
            data.details,
            false
          );
          
          return {
            success: false,
            error: apiError.message,
            details: apiError
          };
        }

        // Generic error from edge function
        const emailError = EmailErrorHandler.createError(
          'EMAIL_SERVICE_ERROR',
          data.message || 'Email service error',
          data.details,
          true
        );
        
        return {
          success: false,
          error: emailError.message,
          details: emailError
        };
      }

      // Success case
      if (data.success) {
        emailLogger.info('Email sent successfully via V2', { messageId: data.messageId });
        
        return {
          success: true,
          messageId: data.messageId,
          details: data.details
        };
      }

      // Unexpected response format
      throw new Error('Unexpected response format from email service V2');
      
    } catch (error) {
      emailLogger.error('Transport V2 error', error);
      const emailError = EmailErrorHandler.categorizeError(error);
      
      return {
        success: false,
        error: emailError.message,
        details: emailError
      };
    }
  }
}
