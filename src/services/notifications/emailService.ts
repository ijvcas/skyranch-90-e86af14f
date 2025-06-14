import { Resend } from "resend";

const resendApiKey = Deno.env.get("RESEND_API_KEY");
const resend = new Resend(resendApiKey);

interface SendEmailProps {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: SendEmailProps) => {
  try {
    const data = await resend.emails.send({
      from: "SkyRanch <onboarding@resend.dev>",
      to: [to],
      subject: subject,
      html: html,
    });

    console.log("Email sent successfully:", data);
    return data;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export const buildEmailTemplate = (
  eventType: string, 
  event: any, 
  userName: string, 
  organizationName: string
): string => {
  const eventTypeMap: Record<string, string> = {
    'reminder': 'Recordatorio',
    'appointment': 'Cita',
    'vaccination': 'Vacunación',
    'medication': 'Medicación',
    'breeding': 'Reproducción',
    'health_check': 'Revisión de Salud',
    'feeding': 'Alimentación',
    'weighing': 'Pesaje',
    'other': 'Otro'
  };

  const eventTitle = eventTypeMap[event.event_type] || event.event_type;
  const eventDate = new Date(event.start_date || event.event_date).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const subject = `${eventType === 'created' ? 'Nuevo evento' : 
                   eventType === 'updated' ? 'Evento actualizado' : 
                   eventType === 'deleted' ? 'Evento cancelado' : 'Recordatorio'}: ${event.title}`;

  const actionText = eventType === 'created' ? 'se ha creado' : 
                     eventType === 'updated' ? 'se ha actualizado' : 
                     eventType === 'deleted' ? 'se ha cancelado' : 'está programado';

  const actionColor = eventType === 'deleted' ? '#ef4444' : '#10b981';

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background-color: #f8fafc; line-height: 1.6;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #10b981 0%, #047857 100%); padding: 30px; text-align: center;">
          <img src="cid:logo" alt="SkyRanch Logo" style="height: 60px; width: auto; margin-bottom: 15px; display: block; margin-left: auto; margin-right: auto;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            ${organizationName}
          </h1>
          <p style="color: #d1fae5; margin: 5px 0 0 0; font-size: 16px; opacity: 0.9;">
            Sistema de Gestión Ganadera
          </p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
          <div style="background-color: ${actionColor}; color: white; padding: 15px 20px; border-radius: 8px; margin-bottom: 30px; text-align: center;">
            <h2 style="margin: 0; font-size: 24px; font-weight: 600;">
              ${subject}
            </h2>
          </div>

          <p style="color: #374151; font-size: 18px; margin-bottom: 25px; font-weight: 500;">
            Hola ${userName},
          </p>
          
          <p style="color: #6b7280; font-size: 16px; margin-bottom: 30px; line-height: 1.6;">
            Te informamos que el evento <strong>${event.title}</strong> ${actionText} en el sistema.
          </p>

          <!-- Event Details Card -->
          <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
            <h3 style="color: #111827; margin: 0 0 20px 0; font-size: 20px; font-weight: 600; border-bottom: 2px solid #10b981; padding-bottom: 10px;">
              📋 Detalles del Evento
            </h3>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #374151; display: inline-block; width: 120px;">Título:</strong>
              <span style="color: #6b7280;">${event.title}</span>
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #374151; display: inline-block; width: 120px;">Tipo:</strong>
              <span style="color: #6b7280;">${eventTitle}</span>
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #374151; display: inline-block; width: 120px;">Fecha:</strong>
              <span style="color: #6b7280;">${eventDate}</span>
            </div>
            
            ${event.description ? `
            <div style="margin-bottom: 15px;">
              <strong style="color: #374151; display: inline-block; width: 120px;">Descripción:</strong>
              <span style="color: #6b7280;">${event.description}</span>
            </div>
            ` : ''}
            
            ${event.location ? `
            <div style="margin-bottom: 15px;">
              <strong style="color: #374151; display: inline-block; width: 120px;">Ubicación:</strong>
              <span style="color: #6b7280;">${event.location}</span>
            </div>
            ` : ''}
          </div>

          ${eventType !== 'deleted' ? `
          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
              Accede al sistema para más detalles
            </p>
            <a href="${window.location?.origin || 'https://app.skyranch.com'}/calendar" 
               style="background: linear-gradient(135deg, #10b981 0%, #047857 100%); 
                      color: white; 
                      text-decoration: none; 
                      padding: 15px 30px; 
                      border-radius: 8px; 
                      font-weight: 600; 
                      font-size: 16px; 
                      display: inline-block; 
                      box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);
                      transition: all 0.3s ease;">
              📅 Ver Calendario
            </a>
          </div>
          ` : ''}
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 25px 30px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="color: #6b7280; margin: 0; font-size: 14px; line-height: 1.5;">
            Este es un mensaje automático del sistema <strong>${organizationName}</strong>.<br>
            Por favor, no respondas a este correo electrónico.
          </p>
          <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; margin: 0; font-size: 12px;">
              © ${new Date().getFullYear()} ${organizationName} - Sistema de Gestión Ganadera
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};
