
import { supabase } from '@/integrations/supabase/client';

export class EmailService {
  async sendEmailNotification(to: string, subject: string, body: string): Promise<boolean> {
    try {
      console.log('📧 Sending email notification to:', to);
      
      // Call Supabase edge function for email sending
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to,
          subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #16a34a;">SkyRanch - Notificación</h2>
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px;">
                <h3>${subject}</h3>
                <p>${body}</p>
              </div>
              <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
                Este mensaje fue enviado desde SkyRanch - Sistema de Gestión Ganadera
              </p>
            </div>
          `
        }
      });

      if (error) {
        console.error('❌ Email sending error:', error);
        return false;
      }

      console.log('✅ Email sent successfully:', data);
      return true;
    } catch (error) {
      console.error('❌ Email service error:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
