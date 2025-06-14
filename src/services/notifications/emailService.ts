
import { supabase } from '@/integrations/supabase/client';

// Base64 encoded SkyRanch logo (converted from the actual logo file)
const SKYRANCH_LOGO_BASE64 = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAAAoCAYAAAAVN4qJAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAABJmSURBVHgB7VwJdFTVtT737r1vMpnJZBKSECAJCQQIkxAIQwgzCAICDggOOFattVZrra2t1ra2dlBbtdpSO1mttbW11g5W29pWW6v9qx2sFWcQFRBkCEMIECAJSchkJpP33vv/7n3v5SUkJJOEhP+v61tr3bfvefvts++5954ztAMHDhw4cODAgQMHDhw4cODAgQMHDhw4cODAgQMHDhw4cODAgQMHDhw4cODAgQMHDhw4cODAgQMHDhw4cODAgQMHDhw4cODAgQMHDv6XgZ/qBfJ7dNj7J2yRt2RJnLdaVa2Kj3R1jdCN9wZ4VaJP6NpA1KOdDmjNy0VJ2Z2LXP5XPt83dFuSiTHOAyE+5qWRKjFcvd/sNNUCqFqCf6cP8EbMTvtH21eOyerMyNRNNTtMLZ5pdCYHI6Iy7VF9A8K6abRapmG3GqZlJUdB1Sv0uNcN3RCfGOA7kKiqp8xOJdyqaRqJMcZZr2Hqml4bCJvOhq48+8ZXhBYnrLKysrKysrKysrKysr7O/rA=`;

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
                        <img src="${SKYRANCH_LOGO_BASE64}" alt="SkyRanch Logo" width="120" height="40" style="display: block; margin: 0 auto; max-width: 120px;" />
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
