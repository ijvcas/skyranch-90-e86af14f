
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
    console.log('🎨 [CALENDAR EMAIL TEMPLATE] Rendering enhanced template with premium branding');
    
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

    // Use the enhanced BaseEmailTemplate with premium branding
    const enhancedData: BaseTemplateData = {
      userName: data.userName || 'Usuario',
      organizationName: data.organizationName || 'SkyRanch',
      logoUrl: data.logoUrl,
      title: subject,
      content: this.buildEventContent(data, actionText, eventDate)
    };

    console.log('✅ [CALENDAR EMAIL TEMPLATE] Enhanced premium template rendered with full branding');
    return super.render(enhancedData);
  }

  private buildEventContent(data: CalendarEventData, actionText: string, eventDate: string): string {
    return `
      <!-- Event Notification Badge -->
      <div style="background: linear-gradient(135deg, #f0f9f0 0%, #ecfdf5 100%); border: 2px solid #059669; padding: 20px; text-align: center; margin-bottom: 30px; border-radius: 12px;">
        <div style="display: inline-flex; align-items: center; justify-content: center; background-color: #047857; color: white; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 16px; margin-bottom: 12px;">
          🔄 NOTIFICACIÓN DE EVENTO
        </div>
        <h2 style="color: #047857; margin: 12px 0 0 0; font-size: 24px; font-weight: bold; font-family: 'Playfair Display', Georgia, serif;">
          ${actionText.toUpperCase()}
        </h2>
      </div>

      <!-- Personal Greeting -->
      <div style="margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #f8fdf8 0%, #f0f9f0 100%); border-radius: 8px;">
        <p style="color: #374151; font-size: 18px; margin-bottom: 12px; font-weight: 600;">
          Estimado/a ${data.userName},
        </p>
        <p style="color: #6b7280; font-size: 16px; margin-bottom: 0; line-height: 1.6;">
          Te informamos que el evento <strong style="color: #047857;">"${data.event.title}"</strong> ${actionText.toLowerCase()} 
          en el sistema de gestión ganadera SkyRanch.
        </p>
      </div>

      <!-- Event Hero Section -->
      <div style="background: linear-gradient(135deg, #047857 0%, #059669 100%); color: white; padding: 30px; text-align: center; margin-bottom: 30px; border-radius: 12px; position: relative; overflow: hidden;">
        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"60\" height=\"60\" viewBox=\"0 0 60 60\"><circle cx=\"30\" cy=\"30\" r=\"2\" fill=\"%23ffffff\" opacity=\"0.1\"/></svg>'); opacity: 0.3;"></div>
        <div style="position: relative; z-index: 1;">
          <h3 style="margin: 0 0 16px 0; font-size: 28px; color: #ffffff; font-weight: bold; font-family: 'Playfair Display', Georgia, serif; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
            ${data.event.title}
          </h3>
          <div style="background-color: rgba(255,255,255,0.2); padding: 12px 20px; border-radius: 8px; display: inline-block;">
            <p style="margin: 0; color: rgba(255,255,255,0.95); font-weight: 600; font-size: 16px;">
              ${actionText}
            </p>
          </div>
        </div>
      </div>

      <!-- Event Details Card -->
      <div style="background-color: #ffffff; border: 2px solid #e5f3e5; border-radius: 12px; padding: 0; margin-bottom: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #047857 0%, #059669 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
          <h4 style="margin: 0; font-size: 20px; font-weight: bold; font-family: 'Playfair Display', Georgia, serif;">
            📋 Detalles del Evento
          </h4>
        </div>
        
        <div style="padding: 25px;">
          <div style="margin-bottom: 18px; display: flex; align-items: flex-start;">
            <strong style="color: #047857; min-width: 120px; font-size: 14px; font-weight: 600;">📝 Título:</strong>
            <span style="color: #374151; margin-left: 12px; font-size: 14px; line-height: 1.5;">${data.event.title}</span>
          </div>
          
          <div style="margin-bottom: 18px; display: flex; align-items: flex-start;">
            <strong style="color: #047857; min-width: 120px; font-size: 14px; font-weight: 600;">📅 Fecha:</strong>
            <span style="color: #374151; margin-left: 12px; font-weight: bold; font-size: 14px; line-height: 1.5;">${eventDate}</span>
          </div>
          
          ${data.event.eventType ? `
          <div style="margin-bottom: 18px; display: flex; align-items: flex-start;">
            <strong style="color: #047857; min-width: 120px; font-size: 14px; font-weight: 600;">🏷️ Tipo:</strong>
            <span style="color: #374151; margin-left: 12px; font-size: 14px; line-height: 1.5;">${this.getEventTypeLabel(data.event.eventType)}</span>
          </div>
          ` : ''}
          
          ${data.event.description ? `
          <div style="margin-bottom: 18px; display: flex; align-items: flex-start;">
            <strong style="color: #047857; min-width: 120px; font-size: 14px; font-weight: 600;">📄 Descripción:</strong>
            <span style="color: #374151; margin-left: 12px; font-size: 14px; line-height: 1.5;">${data.event.description}</span>
          </div>
          ` : ''}
          
          ${data.event.location ? `
          <div style="margin-bottom: 18px; display: flex; align-items: flex-start;">
            <strong style="color: #047857; min-width: 120px; font-size: 14px; font-weight: 600;">📍 Ubicación:</strong>
            <span style="color: #374151; margin-left: 12px; font-size: 14px; line-height: 1.5;">${data.event.location}</span>
          </div>
          ` : ''}
          
          ${data.event.veterinarian ? `
          <div style="margin-bottom: 18px; display: flex; align-items: flex-start;">
            <strong style="color: #047857; min-width: 120px; font-size: 14px; font-weight: 600;">👨‍⚕️ Veterinario:</strong>
            <span style="color: #374151; margin-left: 12px; font-size: 14px; line-height: 1.5;">${data.event.veterinarian}</span>
          </div>
          ` : ''}
        </div>
      </div>

      ${data.eventType !== 'deleted' ? `
      <!-- Call to Action Section -->
      <div style="text-align: center; margin: 30px 0; padding: 30px; background: linear-gradient(135deg, #f8fdf8 0%, #ecfdf5 100%); border: 2px solid #e5f3e5; border-radius: 12px;">
        <div style="margin-bottom: 20px;">
          <h3 style="color: #047857; margin: 0 0 12px 0; font-size: 20px; font-weight: bold; font-family: 'Playfair Display', Georgia, serif;">
            🌟 Accede al Sistema
          </h3>
          <p style="color: #6b7280; font-size: 15px; margin-bottom: 0; line-height: 1.6;">
            Gestiona todos tus eventos ganaderos de manera profesional y eficiente
          </p>
        </div>
        
        <a href="https://id-preview--d956216c-86a1-4ff3-9df4-bdfbbabf459a.lovable.app/calendar" 
           style="display: inline-block; background: linear-gradient(135deg, #047857 0%, #059669 100%); color: white; text-decoration: none; 
                  padding: 16px 32px; font-weight: bold; font-size: 16px; border-radius: 8px; 
                  box-shadow: 0 4px 12px rgba(4, 120, 87, 0.3); transition: all 0.3s ease;">
           📅 Ver Calendario Completo
        </a>
        
        <p style="color: #9ca3af; font-size: 12px; margin: 20px 0 0 0; font-style: italic; line-height: 1.4;">
          Tecnología avanzada para el manejo eficiente de ganado
        </p>
      </div>
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
