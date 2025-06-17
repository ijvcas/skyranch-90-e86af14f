import { EmailContent } from '../interfaces/EmailTypes';
import { BaseEmailTemplate, BaseTemplateData } from './BaseEmailTemplate';

export interface CalendarEventData extends BaseTemplateData {
  eventType: 'created' | 'updated' | 'deleted' | 'reminder';
  event: {
    title: string;
    description?: string;
    eventDate: string;
    eventType?: string;
    location?: string;
    veterinarian?: string;
  };
}

export class CalendarEventTemplate extends BaseEmailTemplate {
  render(data: CalendarEventData): EmailContent {
    console.log('🎨 [CALENDAR EMAIL TEMPLATE] Rendering clean light template without dark green headers');
    
    const eventDate = new Date(data.event.eventDate).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const actionText = this.getActionText(data.eventType);
    const subject = this.getSubject(data.eventType, data.event.title);

    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 20px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; background-color: #f8fafc; line-height: 1.6; color: #334155;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
          
          <!-- Clean Header - No Dark Green Background -->
          <div style="background-color: #ffffff; padding: 30px 20px; text-align: center; border-bottom: 1px solid #e5e7eb;">
            <div style="display: inline-block; margin-bottom: 12px;">
              <img src="https://id-preview--d956216c-86a1-4ff3-9df4-bdfbbabf459a.lovable.app/lovable-uploads/953e2699-9daf-4fea-86c8-e505a1e54eb3.png" alt="SkyRanch Logo" style="width: 50px; height: 50px; border-radius: 8px;">
            </div>
            <h1 style="margin: 0; font-size: 22px; font-weight: 600; color: #10b981; letter-spacing: 0.5px;">
              SKYRANCH
            </h1>
            <p style="margin: 8px 0 0 0; font-size: 12px; color: #6b7280; font-weight: 500;">
              Sistema de Gestión Ganadera
            </p>
          </div>

          <!-- Event Notification Header - Light Background -->
          <div style="background-color: #f0f9f4; padding: 20px; text-align: center; border-bottom: 1px solid #d1fae5;">
            <div style="display: inline-block; background-color: #10b981; color: white; padding: 8px 16px; border-radius: 6px;">
              <h2 style="margin: 0; font-size: 14px; font-weight: 600; color: #ffffff;">
                🔔 NOTIFICACIÓN DE EVENTO
              </h2>
            </div>
          </div>

          <!-- Status Banner - Light Background -->
          <div style="background-color: #ffffff; padding: 20px; text-align: center; border-bottom: 1px solid #e5e7eb;">
            <div style="display: inline-block; border: 2px solid #10b981; color: #10b981; padding: 12px 20px; border-radius: 8px; background-color: #f0f9f4;">
              <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #10b981;">
                ${actionText.toUpperCase()}
              </h3>
            </div>
          </div>

          <!-- Main Content -->
          <div style="padding: 25px; background-color: #ffffff;">
            <p style="color: #10b981; font-size: 16px; font-weight: 600; margin: 0 0 15px 0;">
              Estimado/a ${data.userName || 'Usuario'},
            </p>
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 20px 0; line-height: 1.6;">
              Te informamos que el evento <strong style="color: #10b981;">"${data.event.title}"</strong> ${actionText.toLowerCase()} 
              en el sistema de gestión ganadera SkyRanch.
            </p>

            <!-- Event Title - Light Styling -->
            <div style="background-color: #f0f9f4; border: 2px solid #10b981; color: #10b981; padding: 20px; text-align: center; margin-bottom: 20px; border-radius: 8px;">
              <h3 style="margin: 0 0 10px 0; font-size: 20px; color: #10b981; font-weight: 600;">
                ${data.event.title}
              </h3>
              <div style="background-color: #10b981; color: white; padding: 8px 15px; display: inline-block; border-radius: 4px;">
                <p style="margin: 0; color: white; font-weight: 500; font-size: 12px;">
                  ${actionText}
                </p>
              </div>
            </div>

            <!-- Event Details -->
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
              <h4 style="margin: 0 0 15px 0; font-size: 14px; font-weight: 600; color: #10b981; border-bottom: 2px solid #10b981; padding-bottom: 8px;">
                📋 Detalles del Evento
              </h4>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="color: #10b981; font-weight: 600; font-size: 13px; padding: 8px 0; width: 100px; vertical-align: top;">📝 Título:</td>
                  <td style="color: #374151; font-size: 13px; padding: 8px 0;">${data.event.title}</td>
                </tr>
                <tr>
                  <td style="color: #10b981; font-weight: 600; font-size: 13px; padding: 8px 0; vertical-align: top;">📅 Fecha:</td>
                  <td style="color: #374151; font-weight: 600; font-size: 13px; padding: 8px 0;">${eventDate}</td>
                </tr>
                ${data.event.eventType ? `
                <tr>
                  <td style="color: #10b981; font-weight: 600; font-size: 13px; padding: 8px 0; vertical-align: top;">🏷️ Tipo:</td>
                  <td style="color: #374151; font-size: 13px; padding: 8px 0;">${this.getEventTypeLabel(data.event.eventType)}</td>
                </tr>
                ` : ''}
                ${data.event.description ? `
                <tr>
                  <td style="color: #10b981; font-weight: 600; font-size: 13px; padding: 8px 0; vertical-align: top;">📄 Descripción:</td>
                  <td style="color: #374141; font-size: 13px; padding: 8px 0;">${data.event.description}</td>
                </tr>
                ` : ''}
                ${data.event.location ? `
                <tr>
                  <td style="color: #10b981; font-weight: 600; font-size: 13px; padding: 8px 0; vertical-align: top;">📍 Ubicación:</td>
                  <td style="color: #374151; font-size: 13px; padding: 8px 0;">${data.event.location}</td>
                </tr>
                ` : ''}
                ${data.event.veterinarian ? `
                <tr>
                  <td style="color: #10b981; font-weight: 600; font-size: 13px; padding: 8px 0; vertical-align: top;">👨‍⚕️ Veterinario:</td>
                  <td style="color: #374151; font-size: 13px; padding: 8px 0;">${data.event.veterinarian}</td>
                </tr>
                ` : ''}  
              </table>
            </div>

            ${data.eventType !== 'deleted' ? `
            <!-- Call to Action -->
            <div style="background-color: #f0f9f4; border: 1px solid #d1fae5; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
              <h3 style="color: #10b981; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">
                🌟 Accede al Sistema
              </h3>
              <p style="color: #6b7280; font-size: 13px; margin-bottom: 15px;">
                Gestiona todos tus eventos ganaderos de manera profesional y eficiente
              </p>
              <a href="https://id-preview--d956216c-86a1-4ff3-9df4-bdfbbabf459a.lovable.app/calendar" 
                 style="display: inline-block; background-color: #10b981; color: white; text-decoration: none; 
                        padding: 10px 20px; font-weight: 600; font-size: 13px; border-radius: 6px;">
                 📅 Ver Calendario Completo
              </a>
              <p style="color: #9ca3af; font-size: 10px; margin: 12px 0 0 0; font-style: italic;">
                Tecnología avanzada para el manejo eficiente de ganado
              </p>
            </div>
            ` : ''}
          </div>

          <!-- Clean Footer -->
          <div style="background-color: #f0f9f4; padding: 20px; text-align: center; border-top: 1px solid #d1fae5;">
            <div style="margin-bottom: 15px;">
              <h3 style="color: #10b981; margin: 0 0 8px 0; font-size: 13px; font-weight: 600;">
                Contacto Profesional
              </h3>
              <p style="color: #10b981; margin: 0 0 4px 0; font-size: 12px; font-weight: 600;">
                📧 soporte@skyranch.es
              </p>
              <p style="color: #6b7280; margin: 0; font-size: 10px;">
                Sistema de Gestión Ganadera
              </p>
            </div>
            
            <p style="color: #6b7280; margin: 0 0 12px 0; font-size: 10px; line-height: 1.4;">
              Este es un mensaje automático del sistema <strong style="color: #10b981;">SkyRanch</strong>.<br>
              Por favor, no respondas a este correo electrónico.
            </p>
            
            <p style="color: #9ca3af; margin: 0; font-size: 9px;">
              © ${new Date().getFullYear()} <span style="color: #10b981; font-weight: 600;">SkyRanch</span> - Todos los derechos reservados
            </p>
          </div>
        </div>

        <!-- Background accent -->
        <div style="text-align: center; margin-top: 15px; padding: 12px;">
          <div style="display: inline-block; padding: 6px 12px; background-color: #f0f9f4; border-radius: 15px; border: 1px solid #d1fae5;">
            <p style="color: #10b981; font-size: 9px; margin: 0; font-weight: 600; letter-spacing: 0.3px;">
              🌿 GESTIÓN GANADERA PROFESIONAL 🌿
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Generate simple text version
    const text = `${subject}\n\nEstimado/a ${data.userName || 'Usuario'},\n\nTe informamos que el evento "${data.event.title}" ${actionText.toLowerCase()} en el sistema de gestión ganadera SkyRanch.\n\nDetalles del evento:\n- Título: ${data.event.title}\n- Fecha: ${eventDate}\n${data.event.description ? `- Descripción: ${data.event.description}\n` : ''}${data.event.location ? `- Ubicación: ${data.event.location}\n` : ''}${data.event.veterinarian ? `- Veterinario: ${data.event.veterinarian}\n` : ''}\n\n© ${new Date().getFullYear()} SkyRanch - Sistema de Gestión Ganadera\n\nContacto: soporte@skyranch.es`;

    console.log('✅ [CALENDAR EMAIL TEMPLATE] Clean light template rendered without dark green headers');
    
    return {
      subject,
      html,
      text
    };
  }

  private getEventTypeLabel(eventType: string): string {
    const eventTypeMap: Record<string, string> = {
      'reminder': '⏰ Recordatorio',
      'appointment': '📅 Cita',
      'vaccination': '💉 Vacunación',
      'medication': '💊 Medicación',
      'breeding': '🐄 Reproducción',
      'health_check': '🩺 Revisión de Salud',
      'feeding': '🌾 Alimentación',
      'weighing': '⚖️ Pesaje',
      'other': '📝 Otro'
    };

    return eventTypeMap[eventType] || eventType;
  }

  private getActionText(eventType: string): string {
    switch (eventType) {
      case 'created': return 'Se ha creado exitosamente';
      case 'updated': return 'Se ha actualizado correctamente';
      case 'deleted': return 'Se ha cancelado';
      case 'reminder': return 'Recordatorio importante';
      default: return 'Se ha modificado';
    }
  }

  private getSubject(eventType: string, eventTitle: string): string {
    switch (eventType) {
      case 'created': return `✨ Nuevo evento: ${eventTitle}`;
      case 'updated': return `🔄 Evento actualizado: ${eventTitle}`;
      case 'deleted': return `❌ Evento cancelado: ${eventTitle}`;
      case 'reminder': return `⏰ Recordatorio: ${eventTitle}`;
      default: return `📝 Evento: ${eventTitle}`;
    }
  }
}
