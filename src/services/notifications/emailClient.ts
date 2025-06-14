
import { supabase } from '@/integrations/supabase/client';

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  senderName?: string;
  organizationName?: string;
}

// Simplified email client focused on working functionality
export const sendEmail = async (emailData: EmailData) => {
  try {
    console.log('📧 [EMAIL CLIENT] Starting sendEmail function');
    console.log('📧 [EMAIL CLIENT] Email data:', {
      to: emailData.to,
      subject: emailData.subject,
      htmlLength: emailData.html.length,
      senderName: emailData.senderName
    });

    // Basic validation
    if (!emailData.to || !emailData.subject || !emailData.html) {
      throw new Error('Missing required email data (to, subject, or html)');
    }

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Authentication required to send emails');
    }

    // Prepare clean payload - this is critical for the edge function
    const payload = {
      to: emailData.to.trim(),
      subject: emailData.subject.trim(),
      html: emailData.html,
      senderName: emailData.senderName || "SkyRanch - Sistema de Gestión Ganadera",
      organizationName: emailData.organizationName || "SkyRanch"
    };

    console.log('📧 [EMAIL CLIENT] Calling edge function with payload:', {
      to: payload.to,
      subject: payload.subject,
      htmlLength: payload.html.length
    });
    
    // Call the edge function with proper error handling
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: payload
    });

    console.log('📧 [EMAIL CLIENT] Edge function response:', { data, error });

    if (error) {
      console.error('📧 [EMAIL CLIENT] Edge function error:', error);
      throw new Error(`Email API error: ${error.message}`);
    }

    if (!data) {
      throw new Error('Email API returned no response data');
    }

    if (data.error) {
      throw new Error(`Email API error: ${data.error}`);
    }

    console.log("📧 [EMAIL CLIENT] Email sent successfully:", data);
    return data;
    
  } catch (error) {
    console.error("📧 [EMAIL CLIENT] Error in sendEmail:", error);
    throw new Error(`Email client failed: ${error.message}`);
  }
};
