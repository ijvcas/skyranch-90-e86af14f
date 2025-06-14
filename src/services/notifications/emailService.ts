
import { supabase } from '@/integrations/supabase/client';

// Base64 encoded SkyRanch logo (converted from the original S3 image)
const SKYRANCH_LOGO_BASE64 = 'data:image/png;base64,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';

export class EmailService {
  async sendEmailNotification(to: string, subject: string, body: string, eventDetails?: {
    title: string;
    description?: string;
    eventDate: string;
  }): Promise<boolean> {
    try {
      console.log('📧 Sending email notification to:', to);
      
      // Format the event date for display
      const formattedDate = eventDetails ? 
        new Date(eventDetails.eventDate).toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : '';

      // Call Supabase edge function for email sending
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to,
          subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #16a34a, #22c55e); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                <img src="${SKYRANCH_LOGO_BASE64}" alt="SkyRanch Logo" style="height: 60px; width: auto; margin-bottom: 15px; display: block; margin-left: auto; margin-right: auto;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
                <div style="display: none; background: #ffffff; color: #16a34a; padding: 8px 16px; border-radius: 6px; font-weight: bold; font-size: 18px; margin-bottom: 15px;">SkyRanch</div>
                <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">SkyRanch</h1>
                <p style="color: #f0f9ff; margin: 8px 0 0 0; font-size: 16px;">Sistema de Gestión Ganadera</p>
              </div>
              
              <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
                <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">${subject}</h2>
                
                ${eventDetails ? `
                  <div style="background: #f8fafc; border-left: 4px solid #16a34a; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                    <h3 style="color: #16a34a; margin: 0 0 15px 0; font-size: 20px;">📅 ${eventDetails.title}</h3>
                    <p style="color: #374151; margin: 0 0 10px 0; font-size: 16px;"><strong>📍 Fecha y Hora:</strong> ${formattedDate}</p>
                    ${eventDetails.description ? `<p style="color: #374151; margin: 10px 0 0 0; font-size: 16px;"><strong>📝 Descripción:</strong> ${eventDetails.description}</p>` : ''}
                  </div>
                ` : ''}
                
                <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p style="color: #374151; margin: 0; font-size: 16px; line-height: 1.6;">${body}</p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <div style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                    ✅ Evento Registrado
                  </div>
                </div>
              </div>
              
              <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 12px 12px; text-align: center; border: 1px solid #e5e7eb; border-top: none;">
                <img src="${SKYRANCH_LOGO_BASE64}" alt="SkyRanch Logo" style="height: 40px; width: auto; margin-bottom: 10px; opacity: 0.7; display: block; margin-left: auto; margin-right: auto;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
                <div style="display: none; background: #16a34a; color: white; padding: 4px 12px; border-radius: 4px; font-weight: bold; font-size: 14px; margin-bottom: 10px; display: inline-block;">SkyRanch</div>
                <p style="color: #6b7280; font-size: 14px; margin: 0;">
                  Este mensaje fue enviado desde <strong>SkyRanch</strong><br>
                  Sistema de Gestión Ganadera
                </p>
              </div>
            </div>
          `,
          // Add sender metadata for better email client recognition
          senderName: 'SkyRanch - Sistema de Gestión Ganadera',
          organizationName: 'SkyRanch'
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
