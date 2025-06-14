
import { supabase } from '@/integrations/supabase/client';

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  senderName?: string;
  organizationName?: string;
}

// Enhanced email client with comprehensive error handling and logging
export const sendEmail = async (emailData: EmailData) => {
  try {
    console.log('📧 [EMAIL CLIENT DEBUG] Starting sendEmail function');
    console.log('📧 [EMAIL CLIENT DEBUG] Email data:', {
      to: emailData.to,
      subject: emailData.subject,
      htmlLength: emailData.html.length,
      senderName: emailData.senderName,
      organizationName: emailData.organizationName
    });

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('📧 [EMAIL CLIENT DEBUG] Auth check:', { 
      authenticated: !!user, 
      userId: user?.id, 
      authError: authError?.message 
    });

    if (authError) {
      console.error('📧 [EMAIL CLIENT DEBUG] Authentication error:', authError);
      throw new Error(`Authentication error: ${authError.message}`);
    }

    if (!user) {
      console.error('📧 [EMAIL CLIENT DEBUG] No authenticated user found');
      throw new Error('No authenticated user found');
    }

    console.log('📧 [EMAIL CLIENT DEBUG] About to invoke send-email edge function...');
    console.log('📧 [EMAIL CLIENT DEBUG] Function payload:', {
      to: emailData.to,
      subject: emailData.subject,
      htmlLength: emailData.html.length,
      senderName: emailData.senderName,
      organizationName: emailData.organizationName
    });
    
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: emailData
    });

    console.log('📧 [EMAIL CLIENT DEBUG] Edge function response:', { data, error });

    if (error) {
      console.error('📧 [EMAIL CLIENT DEBUG] Edge function error details:', {
        message: error.message,
        context: error.context,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw new Error(`Email API error: ${error.message}`);
    }

    if (!data) {
      console.warn('📧 [EMAIL CLIENT DEBUG] Edge function returned no data');
      throw new Error('Email API returned no response data');
    }

    // Validate that the response indicates success
    if (data.error) {
      console.error('📧 [EMAIL CLIENT DEBUG] Email API returned error in data:', data.error);
      throw new Error(`Email API error: ${data.error}`);
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
