
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
    console.log('🎨 [CALENDAR EMAIL TEMPLATE] Rendering Gmail-compatible template with simple HTML');
    
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

    // Use simple HTML compatible with Gmail
    const enhancedData: BaseTemplateData = {
      userName: data.userName || 'Usuario',
      organizationName: data.organizationName || 'SkyRanch',
      logoUrl: data.logoUrl,
      title: subject,
      content: this.buildSimpleEventContent(data, actionText, eventDate)
    };

    console.log('✅ [CALENDAR EMAIL TEMPLATE] Gmail-compatible template rendered');
    return super.render(enhancedData);
  }

  private buildSimpleEventContent(data: CalendarEventData, actionText: string, eventDate: string): string {
    return `
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f9f0; border: 2px solid #059669; margin-bottom: 20px;">
        <tr>
          <td style="padding: 20px; text-align: center;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background-color: #047857; color: white; padding: 12px; text-align: center; font-weight: bold; font-size: 16px;">
                  🔄 NOTIFICACIÓN DE EVENTO
                </td>
              </tr>
              <tr>
                <td style="padding: 15px 0; text-align: center;">
                  <h2 style="color: #047857; margin: 0; font-size: 20px; font-weight: bold;">
                    ${actionText.toUpperCase()}
                  </h2>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fdf8; margin-bottom: 20px;">
        <tr>
          <td style="padding: 20px;">
            <p style="color: #374151; font-size: 16px; margin-bottom: 10px; font-weight: 600;">
              Estimado/a ${data.userName},
            </p>
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 0; line-height: 1.6;">
              Te informamos que el evento <strong style="color: #047857;">"${data.event.title}"</strong> ${actionText.toLowerCase()} 
              en el sistema de gestión ganadera SkyRanch.
            </p>
          </td>
        </tr>
      </table>

      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #047857; color: white; margin-bottom: 20px;">
        <tr>
          <td style="padding: 25px; text-align: center;">
            <h3 style="margin: 0 0 15px 0; font-size: 24px; color: white; font-weight: bold;">
              ${data.event.title}
            </h3>
            <div style="background-color: rgba(255,255,255,0.2); padding: 10px 15px; display: inline-block;">
              <p style="margin: 0; color: white; font-weight: 600; font-size: 14px;">
                ${actionText}
              </p>
            </div>
          </td>
        </tr>
      </table>

      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: white; border: 2px solid #e5f3e5; margin-bottom: 20px;">
        <tr>
          <td style="background-color: #047857; color: white; padding: 15px;">
            <h4 style="margin: 0; font-size: 16px; font-weight: bold;">
              📋 Detalles del Evento
            </h4>
          </td>
        </tr>
        <tr>
          <td style="padding: 20px;">
            <table width="100%" cellpadding="5" cellspacing="0">
              <tr>
                <td style="color: #047857; font-weight: 600; font-size: 14px; width: 120px;">📝 Título:</td>
                <td style="color: #374151; font-size: 14px;">${data.event.title}</td>
              </tr>
              <tr>
                <td style="color: #047857; font-weight: 600; font-size: 14px;">📅 Fecha:</td>
                <td style="color: #374151; font-weight: bold; font-size: 14px;">${eventDate}</td>
              </tr>
              ${data.event.eventType ? `
              <tr>
                <td style="color: #047857; font-weight: 600; font-size: 14px;">🏷️ Tipo:</td>
                <td style="color: #374151; font-size: 14px;">${this.getEventTypeLabel(data.event.eventType)}</td>
              </tr>
              ` : ''}
              ${data.event.description ? `
              <tr>
                <td style="color: #047857; font-weight: 600; font-size: 14px; vertical-align: top;">📄 Descripción:</td>
                <td style="color: #374151; font-size: 14px;">${data.event.description}</td>
              </tr>
              ` : ''}
              ${data.event.location ? `
              <tr>
                <td style="color: #047857; font-weight: 600; font-size: 14px;">📍 Ubicación:</td>
                <td style="color: #374151; font-size: 14px;">${data.event.location}</td>
              </tr>
              ` : ''}
              ${data.event.veterinarian ? `
              <tr>
                <td style="color: #047857; font-weight: 600; font-size: 14px;">👨‍⚕️ Veterinario:</td>
                <td style="color: #374151; font-size: 14px;">${data.event.veterinarian}</td>
              </tr>
              ` : ''}
            </table>
          </td>
        </tr>
      </table>

      ${data.eventType !== 'deleted' ? `
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fdf8; border: 2px solid #e5f3e5; margin: 20px 0;">
        <tr>
          <td style="padding: 25px; text-align: center;">
            <h3 style="color: #047857; margin: 0 0 10px 0; font-size: 18px; font-weight: bold;">
              🌟 Accede al Sistema
            </h3>
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 15px;">
              Gestiona todos tus eventos ganaderos de manera profesional y eficiente
            </p>
            <div style="margin: 20px 0;">
              <a href="https://id-preview--d956216c-86a1-4ff3-9df4-bdfbbabf459a.lovable.app/calendar" 
                 style="display: inline-block; background-color: #047857; color: white; text-decoration: none; 
                        padding: 12px 25px; font-weight: bold; font-size: 14px; border-radius: 5px;">
                 📅 Ver Calendario Completo
              </a>
            </div>
            <p style="color: #9ca3af; font-size: 11px; margin: 15px 0 0 0; font-style: italic;">
              Tecnología avanzada para el manejo eficiente de ganado
            </p>
          </td>
        </tr>
      </table>
      ` : ''}
    `;
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
