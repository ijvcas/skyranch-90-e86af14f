
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
    const eventDate = new Date(data.event.eventDate).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const actionText = this.getActionText(data.eventType);
    const actionColor = this.getActionColor(data.eventType);
    const actionIcon = this.getActionIcon(data.eventType);
    const subject = this.getSubject(data.eventType, data.event.title);

    const content = `
      <!-- Hero Notification Badge -->
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; background: ${actionColor}; padding: 16px 32px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
          <div style="color: #ffffff; font-size: 20px; margin-bottom: 4px;">${actionIcon}</div>
          <h2 style="color: #ffffff; margin: 0 0 4px 0; font-size: 18px; font-weight: 600; font-family: 'Playfair Display', Georgia, serif;">
            NOTIFICACIÓN DE EVENTO
          </h2>
          <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 13px; font-weight: 500;">
            ${actionText}
          </p>
        </div>
      </div>

      <!-- Event Title Banner -->
      <div style="text-align: center; margin-bottom: 28px;">
        <div style="background: linear-gradient(135deg, ${actionColor}15 0%, ${actionColor}25 100%); border: 2px solid ${actionColor}40; padding: 20px; border-radius: 12px; position: relative; overflow: hidden;">
          <!-- Decorative corner elements -->
          <div style="position: absolute; top: -5px; right: -5px; width: 20px; height: 20px; background: ${actionColor}; transform: rotate(45deg);"></div>
          <div style="position: absolute; bottom: -5px; left: -5px; width: 20px; height: 20px; background: ${actionColor}; transform: rotate(45deg);"></div>
          
          <h3 style="margin: 0; font-size: 20px; font-weight: 700; color: #047857; font-family: 'Playfair Display', Georgia, serif; line-height: 1.3;">
            ${data.event.title}
          </h3>
          <p style="margin: 8px 0 0 0; color: #059669; font-size: 14px; font-weight: 600;">
            ${actionText}
          </p>
        </div>
      </div>

      <!-- Personal Greeting -->
      <div style="margin-bottom: 28px;">
        <p style="color: #374151; font-size: 17px; margin-bottom: 8px; font-weight: 500;">
          Estimado/a ${data.userName || 'Usuario'},
        </p>
        
        <p style="color: #6b7280; font-size: 15px; margin-bottom: 0; line-height: 1.7;">
          Te informamos que el evento <strong style="color: #047857;">"${data.event.title}"</strong> ${actionText.toLowerCase()} 
          en el sistema de gestión ganadera.
        </p>
      </div>

      <!-- Enhanced Event Details Card -->
      <div style="background: linear-gradient(135deg, #f8fdf8 0%, #f0f9f0 100%); border: 2px solid #e5f3e5; border-radius: 16px; padding: 24px; margin-bottom: 32px; position: relative; overflow: hidden;">
        <!-- Decorative background pattern -->
        <div style="position: absolute; top: 0; right: 0; width: 100px; height: 100px; background: url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><circle cx=\"50\" cy=\"50\" r=\"30\" fill=\"none\" stroke=\"%23059669\" stroke-width=\"2\" opacity=\"0.1\"/><circle cx=\"50\" cy=\"50\" r=\"20\" fill=\"none\" stroke=\"%23059669\" stroke-width=\"1\" opacity=\"0.15\"/></svg>'); opacity: 0.6;"></div>
        
        <div style="position: relative; z-index: 1;">
          <h4 style="color: #047857; margin: 0 0 20px 0; font-size: 18px; font-weight: 700; font-family: 'Playfair Display', Georgia, serif; border-bottom: 2px solid #e5f3e5; padding-bottom: 12px; display: flex; align-items: center;">
            <span style="margin-right: 8px; font-size: 20px;">📋</span>
            Detalles del Evento
          </h4>
          
          <div style="display: grid; gap: 16px;">
            <div style="display: flex; align-items: flex-start; padding: 12px; background-color: #ffffff; border-radius: 8px; border-left: 4px solid #059669;">
              <strong style="color: #047857; display: inline-block; width: 120px; font-size: 14px; font-weight: 600;">📝 Título:</strong>
              <span style="color: #374151; font-size: 14px; font-weight: 500;">${data.event.title}</span>
            </div>
            
            ${data.event.eventType ? `
            <div style="display: flex; align-items: flex-start; padding: 12px; background-color: #ffffff; border-radius: 8px; border-left: 4px solid #0ea5e9;">
              <strong style="color: #047857; display: inline-block; width: 120px; font-size: 14px; font-weight: 600;">🏷️ Tipo:</strong>
              <span style="color: #374151; font-size: 14px; background: linear-gradient(135deg, #0ea5e9, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;">${this.getEventTypeLabel(data.event.eventType)}</span>
            </div>
            ` : ''}
            
            <div style="display: flex; align-items: flex-start; padding: 12px; background-color: #ffffff; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <strong style="color: #047857; display: inline-block; width: 120px; font-size: 14px; font-weight: 600;">📅 Fecha:</strong>
              <span style="color: #374151; font-size: 14px; font-weight: 600;">${eventDate}</span>
            </div>
            
            ${data.event.description ? `
            <div style="display: flex; align-items: flex-start; padding: 12px; background-color: #ffffff; border-radius: 8px; border-left: 4px solid #8b5cf6;">
              <strong style="color: #047857; display: inline-block; width: 120px; font-size: 14px; font-weight: 600;">📄 Descripción:</strong>
              <span style="color: #374151; font-size: 14px; line-height: 1.6;">${data.event.description}</span>
            </div>
            ` : ''}
            
            ${data.event.location ? `
            <div style="display: flex; align-items: flex-start; padding: 12px; background-color: #ffffff; border-radius: 8px; border-left: 4px solid #ef4444;">
              <strong style="color: #047857; display: inline-block; width: 120px; font-size: 14px; font-weight: 600;">📍 Ubicación:</strong>
              <span style="color: #374151; font-size: 14px; font-weight: 500;">${data.event.location}</span>
            </div>
            ` : ''}
            
            ${data.event.veterinarian ? `
            <div style="display: flex; align-items: flex-start; padding: 12px; background-color: #ffffff; border-radius: 8px; border-left: 4px solid #10b981;">
              <strong style="color: #047857; display: inline-block; width: 120px; font-size: 14px; font-weight: 600;">👨‍⚕️ Veterinario:</strong>
              <span style="color: #374151; font-size: 14px; font-weight: 500;">${data.event.veterinarian}</span>
            </div>
            ` : ''}
          </div>
        </div>
      </div>

      ${data.eventType !== 'deleted' ? `
      <!-- Call to Action -->
      <div style="text-align: center; margin: 32px 0; padding: 24px; background: linear-gradient(135deg, #ffffff 0%, #f8fdf8 100%); border-radius: 12px; border: 1px solid #e5f3e5;">
        <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px; font-style: italic;">
          🌟 Accede al sistema para gestionar todos tus eventos ganaderos
        </p>
        <a href="https://id-preview--d956216c-86a1-4ff3-9df4-bdfbbabf459a.lovable.app/calendar" 
           style="background: linear-gradient(135deg, #047857 0%, #059669 50%, #10b981 100%); 
                  color: white; 
                  text-decoration: none; 
                  padding: 14px 32px; 
                  border-radius: 12px; 
                  font-weight: 600; 
                  font-size: 15px; 
                  display: inline-block;
                  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
                  transition: all 0.3s ease;
                  border: 2px solid transparent;">
          📅 Ver Calendario Completo
        </a>
        <p style="color: #9ca3af; font-size: 12px; margin: 16px 0 0 0;">
          Gestiona tu ganado de manera profesional y eficiente
        </p>
      </div>
      ` : ''}
    `;

    return super.render({
      ...data,
      title: subject,
      content
    });
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

  private getActionColor(eventType: string): string {
    switch (eventType) {
      case 'created': return '#059669';
      case 'updated': return '#0ea5e9';
      case 'deleted': return '#dc2626';
      case 'reminder': return '#f59e0b';
      default: return '#6b7280';
    }
  }

  private getActionIcon(eventType: string): string {
    switch (eventType) {
      case 'created': return '✨';
      case 'updated': return '🔄';
      case 'deleted': return '❌';
      case 'reminder': return '⏰';
      default: return '📝';
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
}
