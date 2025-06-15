
import { EmailRequest, EmailResult, EmailTransport } from '../interfaces/EmailTypes';
import { EmailErrorHandler } from '../core/EmailErrorHandler';
import { emailLogger } from '../core/EmailLogger';
import { supabase } from '@/integrations/supabase/client';

export class ResendTransport implements EmailTransport {
  async send(request: EmailRequest): Promise<EmailResult> {
    emailLogger.info('🚀 [TRANSPORT V2] Starting email send via Resend transport V2', {
      to: Array.isArray(request.to) ? request.to.map(t => t.email) : request.to.email,
      subject: request.content.subject
    });

    try {
      // Ensure user is authenticated
      emailLogger.debug('🔐 [TRANSPORT V2] Checking user authentication...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      emailLogger.debug('🔐 [TRANSPORT V2] Authentication check result', { 
        hasUser: !!user, 
        userEmail: user?.email,
        authError: authError?.message 
      });
      
      if (authError || !user) {
        emailLogger.error('❌ [TRANSPORT V2] Authentication failed', authError);
        throw new Error('Authentication required to send emails');
      }

      // Prepare recipients
      const recipients = Array.isArray(request.to) ? request.to : [request.to];
      const toEmail = recipients[0].email; // For now, send to first recipient

      // Prepare payload for the edge function - matching the working direct test format
      const payload = {
        to: toEmail,
        subject: request.content.subject,
        html: request.content.html,
        senderName: request.metadata?.senderName || "SkyRanch - Sistema de Gestión Ganadera",
        organizationName: request.metadata?.organizationName || "SkyRanch",
        metadata: {
          tags: request.metadata?.tags || [
            { name: "category", value: "notification_v2" },
            { name: "sender", value: "skyranch_v2" },
            { name: "version", value: "2_0" }
          ],
          headers: request.metadata?.headers || {}
        }
      };

      emailLogger.debug('📤 [TRANSPORT V2] Calling send-email-v2 edge function with payload', {
        to: payload.to,
        subject: payload.subject,
        senderName: payload.senderName,
        organizationName: payload.organizationName,
        hasHtml: !!payload.html,
        htmlLength: payload.html?.length,
        tagsCount: payload.metadata.tags.length,
        headersCount: Object.keys(payload.metadata.headers).length
      });

      // Call the edge function with explicit error handling
      const { data, error } = await supabase.functions.invoke('send-email-v2', {
        body: payload
      });

      emailLogger.debug('📥 [TRANSPORT V2] Edge function V2 response received', { 
        hasData: !!data, 
        hasError: !!error,
        data: data ? {
          success: data.success,
          error: data.error,
          messageId: data.messageId,
          hasDetails: !!data.details
        } : null,
        error: error ? {
          message: error.message,
          name: error.name
        } : null
      });

      // Handle Supabase function invocation errors
      if (error) {
        emailLogger.error('❌ [TRANSPORT V2] Edge function invocation error', {
          errorMessage: error.message,
          errorName: error.name,
          errorCode: error.code
        });
        
        // Check for specific invocation errors
        if (error.message?.includes('not found') || error.message?.includes('404')) {
          return {
            success: false,
            error: 'Email service not available - edge function not deployed',
            details: { originalError: error, suggestion: 'Contact administrator to deploy edge function' }
          };
        }
        
        if (error.message?.includes('unauthorized') || error.message?.includes('401')) {
          return {
            success: false,
            error: 'Not authorized to send emails',
            details: { originalError: error, suggestion: 'Check user permissions' }
          };
        }
        
        const emailError = EmailErrorHandler.handleResendError(error);
        return {
          success: false,
          error: emailError.message,
          details: emailError
        };
      }

      if (!data) {
        emailLogger.error('❌ [TRANSPORT V2] No response data from email service V2');
        return {
          success: false,
          error: 'No response from email service',
          details: { suggestion: 'Check edge function logs for more details' }
        };
      }

      // Check for specific error types returned by the edge function
      if (data.error) {
        emailLogger.error('❌ [TRANSPORT V2] Email service V2 error', {
          errorType: data.error,
          message: data.message,
          details: data.details
        });
        
        // Handle sandbox mode restrictions
        if (data.error === 'sandbox_mode_restriction') {
          const sandboxError = EmailErrorHandler.createError(
            'SANDBOX_MODE_RESTRICTION',
            'Resend account is in sandbox mode. You can only send emails to your account email address.',
            data.details,
            false
          );
          
          return {
            success: false,
            error: sandboxError.message,
            details: sandboxError
          };
        }

        // Handle domain verification errors
        if (data.error === 'domain_verification_required') {
          const domainError = EmailErrorHandler.createError(
            'DOMAIN_VERIFICATION_REQUIRED',
            'Email domain requires verification in your Resend account.',
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
        emailLogger.info('✅ [TRANSPORT V2] Email sent successfully via V2', { 
          messageId: data.messageId,
          deliveryInfo: data.deliveryInfo 
        });
        
        return {
          success: true,
          messageId: data.messageId,
          details: data.details
        };
      }

      // Unexpected response format
      emailLogger.error('❌ [TRANSPORT V2] Unexpected response format from email service V2', {
        dataKeys: Object.keys(data || {}),
        dataType: typeof data
      });
      return {
        success: false,
        error: 'Unexpected response format from email service',
        details: { response: data, suggestion: 'Check edge function implementation' }
      };
      
    } catch (error) {
      emailLogger.error('❌ [TRANSPORT V2] Transport V2 error', {
        errorMessage: error.message,
        errorName: error.name,
        errorStack: error.stack?.substring(0, 500)
      });
      const emailError = EmailErrorHandler.categorizeError(error);
      
      return {
        success: false,
        error: emailError.message,
        details: emailError
      };
    }
  }
}
