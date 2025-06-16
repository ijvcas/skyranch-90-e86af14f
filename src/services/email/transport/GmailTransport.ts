
import { EmailRequest, EmailResult, EmailTransport } from '../interfaces/EmailTypes';
import { EmailErrorHandler } from '../core/EmailErrorHandler';
import { emailLogger } from '../core/EmailLogger';
import { supabase } from '@/integrations/supabase/client';

export class GmailTransport implements EmailTransport {
  async send(request: EmailRequest): Promise<EmailResult> {
    emailLogger.info('🚀 [GMAIL TRANSPORT] Starting email send via Gmail API', {
      to: Array.isArray(request.to) ? request.to.map(t => t.email) : request.to.email,
      subject: request.content.subject
    });

    try {
      // Enhanced authentication check
      emailLogger.debug('🔐 [GMAIL TRANSPORT] Checking user authentication...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      emailLogger.debug('🔐 [GMAIL TRANSPORT] Authentication check result', { 
        hasUser: !!user, 
        userEmail: user?.email,
        userId: user?.id,
        authError: authError?.message,
        emailVerified: user?.email_confirmed_at ? 'yes' : 'no'
      });
      
      if (authError) {
        emailLogger.error('❌ [GMAIL TRANSPORT] Authentication error details', authError);
        throw new Error(`Authentication failed: ${authError.message}`);
      }
      
      if (!user) {
        emailLogger.error('❌ [GMAIL TRANSPORT] No authenticated user found');
        throw new Error('No authenticated user found - please log in');
      }

      // Prepare recipients
      const recipients = Array.isArray(request.to) ? request.to : [request.to];
      const toEmail = recipients[0].email; // For now, send to first recipient

      // Enhanced payload preparation
      const payload = {
        to: toEmail,
        subject: request.content.subject,
        html: request.content.html,
        senderName: request.metadata?.senderName || "SkyRanch - Sistema de Gestión Ganadera",
        organizationName: request.metadata?.organizationName || "SkyRanch",
        metadata: {
          tags: request.metadata?.tags || [
            { name: "category", value: "notification_gmail" },
            { name: "sender", value: "skyranch_gmail" },
            { name: "version", value: "gmail_1_0" }
          ],
          headers: request.metadata?.headers || {}
        }
      };

      emailLogger.debug('📤 [GMAIL TRANSPORT] Calling send-gmail edge function', {
        to: payload.to,
        subject: payload.subject,
        senderName: payload.senderName,
        organizationName: payload.organizationName,
        hasHtml: !!payload.html,
        htmlLength: payload.html?.length,
        tagsCount: payload.metadata.tags.length,
        authToken: user ? 'present' : 'missing',
        timestamp: new Date().toISOString()
      });

      // Call the Gmail edge function
      emailLogger.debug('📤 [GMAIL TRANSPORT] About to invoke Gmail edge function...');
      const startTime = Date.now();
      
      const { data, error } = await supabase.functions.invoke('send-gmail', {
        body: payload
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      emailLogger.debug('📥 [GMAIL TRANSPORT] Gmail edge function response received', { 
        duration: `${duration}ms`,
        hasData: !!data, 
        hasError: !!error,
        dataSuccess: data?.success,
        dataError: data?.error,
        dataMessage: data?.message,
        messageId: data?.messageId,
        threadId: data?.threadId,
        errorMessage: error?.message,
        timestamp: new Date().toISOString()
      });

      // Handle Supabase function invocation errors first
      if (error) {
        emailLogger.error('❌ [GMAIL TRANSPORT] Edge function invocation error', {
          errorMessage: error.message,
          errorName: error.name,
          errorCode: error.code,
          errorDetails: error,
          duration: `${duration}ms`
        });
        
        // Enhanced error handling for common invocation issues
        if (error.message?.includes('not found') || error.message?.includes('404')) {
          return {
            success: false,
            error: 'Gmail service not available - edge function not deployed',
            details: { originalError: error, suggestion: 'Contact administrator to deploy Gmail edge function' }
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
            error: 'Gmail service timeout - please try again',
            details: { originalError: error, suggestion: 'Retry the operation' }
          };
        }
        
        const emailError = EmailErrorHandler.handleResendError(error);
        return {
          success: false,
          error: `Gmail edge function invocation failed: ${emailError.message}`,
          details: emailError
        };
      }

      if (!data) {
        emailLogger.error('❌ [GMAIL TRANSPORT] No response data from Gmail service');
        return {
          success: false,
          error: 'No response from Gmail service',
          details: { suggestion: 'Check Gmail edge function logs for more details' }
        };
      }

      // Handle specific error types returned by the edge function
      if (data.error) {
        emailLogger.error('❌ [GMAIL TRANSPORT] Gmail service error', {
          errorType: data.error,
          message: data.message,
          details: data.details,
          duration: `${duration}ms`
        });
        
        return {
          success: false,
          error: data.message || `Gmail service error: ${data.error}`,
          details: { errorType: 'GMAIL_SERVICE_ERROR', originalError: data.error, ...data.details }
        };
      }

      // Success case
      if (data.success) {
        emailLogger.info('✅ [GMAIL TRANSPORT] Email sent successfully via Gmail', { 
          messageId: data.messageId,
          threadId: data.threadId,
          deliveryInfo: data.details,
          duration: `${duration}ms`,
          recipient: toEmail
        });
        
        return {
          success: true,
          messageId: data.messageId,
          details: { ...data.details, threadId: data.threadId }
        };
      }

      // Unexpected response format
      emailLogger.error('❌ [GMAIL TRANSPORT] Unexpected response format from Gmail service', {
        dataKeys: Object.keys(data || {}),
        dataType: typeof data,
        fullData: data,
        duration: `${duration}ms`
      });
      return {
        success: false,
        error: 'Unexpected response format from Gmail service',
        details: { response: data, suggestion: 'Check Gmail edge function implementation' }
      };
      
    } catch (error) {
      emailLogger.error('❌ [GMAIL TRANSPORT] Transport unexpected error', {
        errorMessage: error.message,
        errorName: error.name,
        errorStack: error.stack?.substring(0, 500),
        fullError: error
      });
      
      const emailError = EmailErrorHandler.categorizeError(error);
      
      return {
        success: false,
        error: `Gmail transport error: ${emailError.message}`,
        details: emailError
      };
    }
  }
}
