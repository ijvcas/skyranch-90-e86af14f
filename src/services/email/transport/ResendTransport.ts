
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
      // Ensure user is authenticated - with better error handling
      emailLogger.debug('🔐 [TRANSPORT V2] Checking user authentication...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      emailLogger.debug('🔐 [TRANSPORT V2] Authentication check result', { 
        hasUser: !!user, 
        userEmail: user?.email,
        authError: authError?.message 
      });
      
      if (authError) {
        emailLogger.error('❌ [TRANSPORT V2] Authentication error details', authError);
        throw new Error(`Authentication failed: ${authError.message}`);
      }
      
      if (!user) {
        emailLogger.error('❌ [TRANSPORT V2] No authenticated user found');
        throw new Error('No authenticated user found - please log in');
      }

      // Prepare recipients
      const recipients = Array.isArray(request.to) ? request.to : [request.to];
      const toEmail = recipients[0].email; // For now, send to first recipient

      // Prepare payload for the edge function - using the EXACT same format as working direct test
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

      emailLogger.debug('📤 [TRANSPORT V2] Calling send-email-v2 edge function with exact working payload format', {
        to: payload.to,
        subject: payload.subject,
        senderName: payload.senderName,
        organizationName: payload.organizationName,
        hasHtml: !!payload.html,
        htmlLength: payload.html?.length,
        tagsCount: payload.metadata.tags.length,
        authToken: user ? 'present' : 'missing'
      });

      // Call the edge function using the same approach as the working direct test
      emailLogger.debug('📤 [TRANSPORT V2] About to invoke edge function...');
      const { data, error } = await supabase.functions.invoke('send-email-v2', {
        body: payload
      });

      emailLogger.debug('📥 [TRANSPORT V2] Edge function V2 response received', { 
        hasData: !!data, 
        hasError: !!error,
        dataSuccess: data?.success,
        dataError: data?.error,
        dataMessage: data?.message,
        errorMessage: error?.message
      });

      // Handle Supabase function invocation errors first
      if (error) {
        emailLogger.error('❌ [TRANSPORT V2] Edge function invocation error', {
          errorMessage: error.message,
          errorName: error.name,
          errorCode: error.code,
          errorDetails: error
        });
        
        // Enhanced error handling for common invocation issues
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
            error: 'Not authorized to send emails - authentication required',
            details: { originalError: error, suggestion: 'Please log in again' }
          };
        }

        if (error.message?.includes('timeout')) {
          return {
            success: false,
            error: 'Email service timeout - please try again',
            details: { originalError: error, suggestion: 'Retry the operation' }
          };
        }
        
        const emailError = EmailErrorHandler.handleResendError(error);
        return {
          success: false,
          error: `Edge function invocation failed: ${emailError.message}`,
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

      // Handle specific error types returned by the edge function (same as working direct test)
      if (data.error) {
        emailLogger.error('❌ [TRANSPORT V2] Email service V2 error', {
          errorType: data.error,
          message: data.message,
          details: data.details
        });
        
        // Handle all the same error types as the working direct test
        const errorHandlers = {
          'sandbox_mode_restriction': () => ({
            success: false,
            error: 'Resend account is in sandbox mode. You can only send emails to your account email address.',
            details: { errorType: 'SANDBOX_MODE_RESTRICTION', ...data.details }
          }),
          'domain_verification_required': () => ({
            success: false,
            error: 'Email domain requires verification in your Resend account.',
            details: { errorType: 'DOMAIN_VERIFICATION_REQUIRED', ...data.details }
          }),
          'rate_limited': () => ({
            success: false,
            error: 'Rate limit exceeded, please try again later',
            details: { errorType: 'RATE_LIMITED', retryable: true, ...data.details }
          }),
          'invalid_api_key': () => ({
            success: false,
            error: 'Invalid or missing Resend API key',
            details: { errorType: 'INVALID_API_KEY', ...data.details }
          })
        };

        const handler = errorHandlers[data.error];
        if (handler) {
          return handler();
        }

        // Generic error from edge function
        return {
          success: false,
          error: data.message || `Email service error: ${data.error}`,
          details: { errorType: 'EMAIL_SERVICE_ERROR', originalError: data.error, ...data.details }
        };
      }

      // Success case - same as working direct test
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
        dataType: typeof data,
        fullData: data
      });
      return {
        success: false,
        error: 'Unexpected response format from email service',
        details: { response: data, suggestion: 'Check edge function implementation' }
      };
      
    } catch (error) {
      emailLogger.error('❌ [TRANSPORT V2] Transport V2 unexpected error', {
        errorMessage: error.message,
        errorName: error.name,
        errorStack: error.stack?.substring(0, 500),
        fullError: error
      });
      
      const emailError = EmailErrorHandler.categorizeError(error);
      
      return {
        success: false,
        error: `Transport error: ${emailError.message}`,
        details: emailError
      };
    }
  }
}
