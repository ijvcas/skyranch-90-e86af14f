
import { supabase } from '@/integrations/supabase/client';

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  senderName?: string;
  organizationName?: string;
}

export const sendEmail = async (emailData: EmailData) => {
  try {
    console.log('📧 [EMAIL CLIENT] Sending email to:', emailData.to);
    console.log('📧 [EMAIL CLIENT] Subject:', emailData.subject);

    if (!emailData.to || !emailData.subject || !emailData.html) {
      throw new Error('Missing required email data (to, subject, or html)');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Authentication required to send emails');
    }

    const payload = {
      to: emailData.to.trim(),
      subject: emailData.subject.trim(),
      html: emailData.html,
      senderName: emailData.senderName || "SkyRanch - Sistema de Gestión Ganadera",
      organizationName: emailData.organizationName || "SkyRanch"
    };

    console.log('📧 [EMAIL CLIENT] Calling edge function...');
    
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: payload
    });

    console.log('📧 [EMAIL CLIENT] Edge function response:', { data, error });

    if (error) {
      console.error('📧 [EMAIL CLIENT] Edge function error:', error);
      throw new Error(`Email sending failed: ${error.message}`);
    }

    if (!data) {
      throw new Error('No response data from email service');
    }

    // Check for specific error types returned by the edge function
    if (data.error) {
      console.error('📧 [EMAIL CLIENT] Email service error:', data);
      
      if (data.error === 'resend_api_error') {
        throw new Error(`Email API error: ${data.message}`);
      }
      
      throw new Error(`Email service error: ${data.message || 'Unknown error'}`);
    }

    console.log("📧 [EMAIL CLIENT] Email sent successfully");
    return data;
    
  } catch (error) {
    console.error("📧 [EMAIL CLIENT] Error:", error);
    throw error;
  }
};
