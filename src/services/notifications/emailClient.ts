
import { supabase } from '@/integrations/supabase/client';

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  senderName?: string;
  organizationName?: string;
}

// Simple email client that calls the edge function using Supabase client
export const sendEmail = async (emailData: EmailData) => {
  try {
    console.log('📧 [EMAIL CLIENT DEBUG] Calling send-email edge function with data:', {
      to: emailData.to,
      subject: emailData.subject,
      htmlLength: emailData.html.length,
      senderName: emailData.senderName,
      organizationName: emailData.organizationName
    });
    
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: emailData
    });

    if (error) {
      console.error('📧 [EMAIL CLIENT DEBUG] Edge function error:', error);
      throw new Error(`Email API error: ${error.message}`);
    }

    console.log("📧 [EMAIL CLIENT DEBUG] Email sent successfully via edge function:", data);
    return data;
  } catch (error) {
    console.error("📧 [EMAIL CLIENT DEBUG] Error sending email:", error);
    console.error("📧 [EMAIL CLIENT DEBUG] Error details:", {
      message: error.message,
      stack: error.stack,
      emailData: {
        to: emailData.to,
        subject: emailData.subject,
        senderName: emailData.senderName
      }
    });
    throw error;
  }
};
