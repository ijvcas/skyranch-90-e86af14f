
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
    console.log('📧 Calling send-email edge function with data:', emailData);
    
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: emailData
    });

    if (error) {
      console.error('📧 Edge function error:', error);
      throw new Error(`Email API error: ${error.message}`);
    }

    console.log("📧 Email sent successfully via edge function:", data);
    return data;
  } catch (error) {
    console.error("📧 Error sending email:", error);
    throw error;
  }
};
