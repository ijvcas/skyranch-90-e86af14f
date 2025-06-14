
import { supabase } from '@/integrations/supabase/client';

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  senderName?: string;
  organizationName?: string;
}

// Enhanced email client with comprehensive error handling and logging
export const sendEmail = async (emailData: EmailData, retryCount = 0) => {
  const maxRetries = 2;
  
  try {
    console.log('📧 [EMAIL CLIENT DEBUG] Starting sendEmail function');
    console.log('📧 [EMAIL CLIENT DEBUG] Email data:', {
      to: emailData.to,
      subject: emailData.subject,
      htmlLength: emailData.html.length,
      senderName: emailData.senderName,
      organizationName: emailData.organizationName,
      retryCount
    });

    // Validate email data before proceeding
    if (!emailData.to || !emailData.subject || !emailData.html) {
      const error = 'Missing required email data (to, subject, or html)';
      console.error('📧 [EMAIL CLIENT DEBUG] Validation error:', error);
      throw new Error(error);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailData.to)) {
      const error = `Invalid email format: ${emailData.to}`;
      console.error('📧 [EMAIL CLIENT DEBUG] Email format error:', error);
      throw new Error(error);
    }

    // Check if user is authenticated with detailed logging
    console.log('📧 [EMAIL CLIENT DEBUG] Checking authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('📧 [EMAIL CLIENT DEBUG] Auth check result:', { 
      authenticated: !!user, 
      userId: user?.id, 
      userEmail: user?.email,
      authError: authError?.message 
    });

    if (authError) {
      console.error('📧 [EMAIL CLIENT DEBUG] Authentication error:', authError);
      throw new Error(`Authentication error: ${authError.message}`);
    }

    if (!user) {
      console.error('📧 [EMAIL CLIENT DEBUG] No authenticated user found');
      throw new Error('No authenticated user found - please log in');
    }

    // Get current session to ensure we have valid tokens
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('📧 [EMAIL CLIENT DEBUG] Session check:', {
      hasSession: !!session,
      hasAccessToken: !!session?.access_token,
      sessionError: sessionError?.message
    });

    if (sessionError || !session) {
      console.error('📧 [EMAIL CLIENT DEBUG] Session error:', sessionError);
      throw new Error('Invalid session - please log in again');
    }

    // Prepare the request payload with validation
    const requestPayload = {
      to: emailData.to.trim(),
      subject: emailData.subject.trim(),
      html: emailData.html,
      senderName: emailData.senderName || "SkyRanch - Sistema de Gestión Ganadera",
      organizationName: emailData.organizationName || "SkyRanch"
    };

    console.log('📧 [EMAIL CLIENT DEBUG] About to invoke send-email edge function...');
    console.log('📧 [EMAIL CLIENT DEBUG] Function payload:', {
      to: requestPayload.to,
      subject: requestPayload.subject,
      htmlLength: requestPayload.html.length,
      senderName: requestPayload.senderName,
      organizationName: requestPayload.organizationName
    });
    
    // Call the edge function with proper error handling
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: requestPayload,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('📧 [EMAIL CLIENT DEBUG] Edge function response:', { 
      data, 
      error,
      hasData: !!data,
      errorMessage: error?.message,
      errorContext: error?.context
    });

    // Handle edge function errors
    if (error) {
      console.error('📧 [EMAIL CLIENT DEBUG] Edge function error details:', {
        message: error.message,
        context: error.context,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      // Retry on certain types of errors
      if (retryCount < maxRetries && (
        error.message?.includes('timeout') || 
        error.message?.includes('network') ||
        error.message?.includes('connection')
      )) {
        console.log(`📧 [EMAIL CLIENT DEBUG] Retrying email send (attempt ${retryCount + 1}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
        return sendEmail(emailData, retryCount + 1);
      }
      
      throw new Error(`Email API error: ${error.message}`);
    }

    // Validate response data
    if (!data) {
      console.warn('📧 [EMAIL CLIENT DEBUG] Edge function returned no data');
      throw new Error('Email API returned no response data');
    }

    // Check for errors in the response data
    if (data.error) {
      console.error('📧 [EMAIL CLIENT DEBUG] Email API returned error in data:', data.error);
      throw new Error(`Email API error: ${data.error}`);
    }

    // Validate successful response structure
    if (typeof data !== 'object' || (!data.data && !data.id)) {
      console.error('📧 [EMAIL CLIENT DEBUG] Invalid response structure:', data);
      throw new Error('Email API returned invalid response structure');
    }

    console.log("📧 [EMAIL CLIENT DEBUG] Email sent successfully via edge function:", data);
    return data;
  } catch (error) {
    console.error("📧 [EMAIL CLIENT DEBUG] Critical error in sendEmail:", error);
    console.error("📧 [EMAIL CLIENT DEBUG] Error stack trace:", error.stack);
    console.error("📧 [EMAIL CLIENT DEBUG] Error details:", {
      name: error.name,
      message: error.message,
      cause: error.cause,
      retryCount,
      emailData: {
        to: emailData.to,
        subject: emailData.subject,
        senderName: emailData.senderName
      }
    });
    
    // Re-throw the error to ensure it propagates up the chain
    throw new Error(`Email client failed: ${error.message}`);
  }
};
