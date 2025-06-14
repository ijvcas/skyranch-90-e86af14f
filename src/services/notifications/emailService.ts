
import { supabase } from '@/integrations/supabase/client';

// Base64 encoded SkyRanch logo - using the actual logo from the application
const SKYRANCH_LOGO_BASE64 = `data:image/png;base64,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`;

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
            <table width="100%" cellpadding="0" cellspacing="0" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <tr>
                <td>
                  <table width="100%" cellpadding="30" cellspacing="0" style="background: linear-gradient(135deg, #16a34a, #22c55e); border-radius: 12px 12px 0 0;">
                    <tr>
                      <td style="text-align: center;">
                        <img src="${SKYRANCH_LOGO_BASE64}" alt="SkyRanch Logo" width="120" height="40" style="display: block; margin: 0 auto; max-width: 120px; height: auto;" />
                        <h1 style="color: white; margin: 15px 0 0 0; font-size: 28px; font-weight: bold;">SkyRanch</h1>
                        <p style="color: #f0f9ff; margin: 8px 0 0 0; font-size: 16px;">Sistema de Gestión Ganadera</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <tr>
                <td style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
                  <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">${subject}</h2>
                  
                  ${eventDetails ? `
                    <table width="100%" cellpadding="20" cellspacing="0" style="background: #f8fafc; border-left: 4px solid #16a34a; margin: 20px 0; border-radius: 0 8px 8px 0;">
                      <tr>
                        <td>
                          <h3 style="color: #16a34a; margin: 0 0 15px 0; font-size: 20px;">📅 ${eventDetails.title}</h3>
                          <p style="color: #374151; margin: 0 0 10px 0; font-size: 16px;"><strong>📍 Fecha y Hora:</strong> ${formattedDate}</p>
                          ${eventDetails.description ? `<p style="color: #374151; margin: 10px 0 0 0; font-size: 16px;"><strong>📝 Descripción:</strong> ${eventDetails.description}</p>` : ''}
                        </td>
                      </tr>
                    </table>
                  ` : ''}
                  
                  <table width="100%" cellpadding="20" cellspacing="0" style="background: #f9fafb; border-radius: 8px; margin: 20px 0;">
                    <tr>
                      <td>
                        <p style="color: #374151; margin: 0; font-size: 16px; line-height: 1.6;">${body}</p>
                      </td>
                    </tr>
                  </table>
                  
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                    <tr>
                      <td style="text-align: center;">
                        <div style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; border-radius: 8px; font-weight: bold;">
                          ✅ Evento Registrado
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <tr>
                <td style="background: #f9fafb; padding: 20px; border-radius: 0 0 12px 12px; text-align: center; border: 1px solid #e5e7eb; border-top: none;">
                  <div style="background: #16a34a; color: white; padding: 8px 16px; border-radius: 6px; font-weight: bold; font-size: 18px; margin-bottom: 10px; display: inline-block;">SkyRanch</div>
                  <p style="color: #6b7280; font-size: 14px; margin: 0;">
                    Este mensaje fue enviado desde <strong>SkyRanch</strong><br>
                    Sistema de Gestión Ganadera
                  </p>
                </td>
              </tr>
            </table>
          `,
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
