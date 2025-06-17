
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
    console.log('🎨 [CALENDAR EMAIL TEMPLATE] Rendering simple text-based template for compatibility');
    
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

    // Simple HTML template without complex CSS that might be stripped
    const content = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        
        <!-- Header -->
        <div style="background-color: #047857; color: white; padding: 30px 20px; text-align: center; margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">SKYRANCH</h1>
          <p style="margin: 10px 0 0 0; font-size: 14px;">Sistema de Gestión Ganadera</p>
        </div>

        <!-- Event Notification Badge -->
        <div style="background-color: #f0f9f0; border: 2px solid #059669; padding: 15px 20px; text-align: center; margin-bottom: 25px;">
          <p style="margin: 0; color: #047857; font-weight: bold; font-size: 16px;">🔄 NOTIFICACIÓN DE EVENTO</p>
        </div>

        <!-- Action Text -->
        <div style="text-align: center; margin-bottom: 25px;">
          <h2 style="color: #047857; margin: 0; font-size: 24px; font-weight: bold;">${actionText.toUpperCase()}</h2>
        </div>

        <!-- Event Title -->
        <div style="background-color: #f8fdf8; border: 3px solid #059669; padding: 20px; text-align: center; margin-bottom: 25px;">
          <h3 style="margin: 0; font-size: 20px; color: #047857; font-weight: bold;">${data.event.title}</h3>
          <p style="margin: 10px 0 0 0; color: #059669; font-weight: bold;">${actionText}</p>
        </div>

        <!-- Personal Greeting -->
        <div style="margin-bottom: 25px;">
          <p style="color: #374151; font-size: 16px; margin-bottom: 10px; font-weight: bold;">
            Estimado/a ${data.userName || 'Usuario'},
          </p>
          <p style="color: #6b7280; font-size: 15px; margin-bottom: 0;">
            Te informamos que el evento <strong style="color: #047857;">"${data.event.title}"</strong> ${actionText.toLowerCase()} 
            en el sistema de gestión ganadera SkyRanch.
          </p>
        </div>

        <!-- Event Details -->
        <div style="background-color: #ffffff; border: 2px solid #e5f3e5; padding: 25px; margin-bottom: 25px;">
          <div style="background-color: #047857; color: white; padding: 15px; margin: -25px -25px 20px -25px;">
            <h4 style="margin: 0; font-size: 18px; font-weight: bold;">📋 Detalles del Evento</h4>
          </div>
          
          <div style="margin-bottom: 15px;">
            <strong style="color: #047857;">📝 Título:</strong>
            <span style="color: #374151; margin-left: 10px;">${data.event.title}</span>
          </div>
          
          <div style="margin-bottom: 15px;">
            <strong style="color: #047857;">📅 Fecha y Hora:</strong>
            <span style="color: #374151; margin-left: 10px; font-weight: bold;">${eventDate}</span>
          </div>
          
          ${data.event.eventType ? `
          <div style="margin-bottom: 15px;">
            <strong style="color: #047857;">🏷️ Tipo:</strong>
            <span style="color: #374151; margin-left: 10px;">${this.getEventTypeLabel(data.event.eventType)}</span>
          </div>
          ` : ''}
          
          ${data.event.description ? `
          <div style="margin-bottom: 15px;">
            <strong style="color: #047857;">📄 Descripción:</strong>
            <span style="color: #374151; margin-left: 10px;">${data.event.description}</span>
          </div>
          ` : ''}
          
          ${data.event.location ? `
          <div style="margin-bottom: 15px;">
            <strong style="color: #047857;">📍 Ubicación:</strong>
            <span style="color: #374151; margin-left: 10px;">${data.event.location}</span>
          </div>
          ` : ''}
          
          ${data.event.veterinarian ? `
          <div style="margin-bottom: 15px;">
            <strong style="color: #047857;">👨‍⚕️ Veterinario:</strong>
            <span style="color: #374151; margin-left: 10px;">${data.event.veterinarian}</span>
          </div>
          ` : ''}
        </div>

        ${data.eventType !== 'deleted' ? `
        <!-- Call to Action -->
        <div style="text-align: center; margin: 30px 0; padding: 25px; background-color: #f8fdf8; border: 2px solid #e5f3e5;">
          <p style="color: #6b7280; font-size: 15px; margin-bottom: 15px;">
            🌟 Accede al sistema para gestionar todos tus eventos ganaderos
          </p>
          <p style="color: #9ca3af; font-size: 13px; margin-bottom: 20px; font-style: italic;">
            Gestión profesional y eficiente de tu ganado
          </p>
          
          <a href="https://id-preview--d956216c-86a1-4ff3-9df4-bdfbbabf459a.lovable.app/calendar" 
             style="display: inline-block; background-color: #047857; color: white; text-decoration: none; 
                    padding: 12px 30px; font-weight: bold; font-size: 15px; text-transform: uppercase;">
             📅 Ver Calendario Completo
          </a>
          
          <p style="color: #9ca3af; font-size: 11px; margin: 15px 0 0 0; font-style: italic;">
            Tecnología avanzada para el manejo eficiente de ganado
          </p>
        </div>
        ` : ''}

        <!-- Footer -->
        <div style="background-color: #f8fdf8; padding: 20px; text-align: center; border-top: 1px solid #e5f3e5; margin-top: 30px;">
          <p style="color: #047857; margin: 0 0 10px 0; font-size: 14px; font-weight: bold;">
            Contacto Profesional
          </p>
          <p style="color: #059669; margin: 0 0 5px 0; font-size: 13px;">
            📧 soporte@skyranch.es
          </p>
          <p style="color: #6b7280; margin: 0 0 15px 0; font-size: 12px;">
            🏢 SkyRanch - Sistema de Gestión Ganadera Profesional
          </p>
          
          <div style="margin: 15px 0;">
            <span style="color: #059669; font-size: 16px;">🐄</span>
          </div>
          
          <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 11px;">
            Este es un mensaje automático del sistema <strong style="color: #047857;">SkyRanch</strong>.<br>
            Por favor, no respondas a este correo electrónico.
          </p>
          
          <p style="color: #9ca3af; margin: 0; font-size: 10px; font-style: italic;">
            © ${new Date().getFullYear()} SkyRanch - Todos los derechos reservados
          </p>
        </div>
      </div>
    `;

    console.log('✅ [CALENDAR EMAIL TEMPLATE] Simple compatible template rendered');

    return {
      subject,
      html: content,
      text: this.htmlToText(content)
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
