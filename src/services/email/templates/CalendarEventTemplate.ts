
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
    const subject = this.getSubject(data.eventType, data.event.title);

    const content = `
      <div style="display: flex; justify-content: center; padding: 0 0 16px 0;">
        <div style="background-color: #059669; padding: 16px 32px; border-radius: 8px; text-align: center; max-width: 400px;">
          <h2 style="color: #ffffff; margin: 0 0 4px 0; font-size: 16px; font-weight: 500;">
            NOTIFICACIÓN DE EVENTO
          </h2>
          <p style="color: #ecfdf5; margin: 0; font-size: 12px; font-weight: 400;">
            ${actionText}
          </p>
        </div>
      </div>

      <div style="padding: 16px 0; display: flex; justify-content: center;">
        <div style="background-color: ${actionColor}; color: white; padding: 12px 24px; border-radius: 6px; text-align: center; max-width: 400px;">
          <h3 style="margin: 0; font-size: 14px; font-weight: 500;">
            ${subject}
          </h3>
        </div>
      </div>

      <div style="padding: 0 0 24px 0;">
        <p style="color: #374151; font-size: 16px; margin-bottom: 20px; font-weight: 500;">
          Hola ${data.userName || 'Usuario'},
        </p>
        
        <p style="color: #6b7280; font-size: 14px; margin-bottom: 24px; line-height: 1.6;">
          Te informamos que el evento <strong>${data.event.title}</strong> ${actionText.toLowerCase()} en el sistema.
        </p>

        <!-- Event Details Card -->
        <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <h4 style="color: #111827; margin: 0 0 16px 0; font-size: 16px; font-weight: 600; border-bottom: 1px solid #d1d5db; padding-bottom: 8px;">
            📋 Detalles del Evento
          </h4>
          
          <div style="margin-bottom: 12px;">
            <strong style="color: #374151; display: inline-block; width: 100px; font-size: 13px;">Título:</strong>
            <span style="color: #6b7280; font-size: 13px;">${data.event.title}</span>
          </div>
          
          ${data.event.eventType ? `
          <div style="margin-bottom: 12px;">
            <strong style="color: #374151; display: inline-block; width: 100px; font-size: 13px;">Tipo:</strong>
            <span style="color: #6b7280; font-size: 13px;">${this.getEventTypeLabel(data.event.eventType)}</span>
          </div>
          ` : ''}
          
          <div style="margin-bottom: 12px;">
            <strong style="color: #374151; display: inline-block; width: 100px; font-size: 13px;">Fecha:</strong>
            <span style="color: #6b7280; font-size: 13px;">${eventDate}</span>
          </div>
          
          ${data.event.description ? `
          <div style="margin-bottom: 12px;">
            <strong style="color: #374151; display: inline-block; width: 100px; font-size: 13px;">Descripción:</strong>
            <span style="color: #6b7280; font-size: 13px;">${data.event.description}</span>
          </div>
          ` : ''}
          
          ${data.event.location ? `
          <div style="margin-bottom: 12px;">
            <strong style="color: #374151; display: inline-block; width: 100px; font-size: 13px;">Ubicación:</strong>
            <span style="color: #6b7280; font-size: 13px;">${data.event.location}</span>
          </div>
          ` : ''}
          
          ${data.event.veterinarian ? `
          <div style="margin-bottom: 12px;">
            <strong style="color: #374151; display: inline-block; width: 100px; font-size: 13px;">Veterinario:</strong>
            <span style="color: #6b7280; font-size: 13px;">${data.event.veterinarian}</span>
          </div>
          ` : ''}
        </div>

        ${data.eventType !== 'deleted' ? `
        <div style="text-align: center; margin: 24px 0;">
          <p style="color: #6b7280; font-size: 12px; margin-bottom: 16px;">
            Accede al sistema para más detalles
          </p>
          <a href="https://ahwhtxygyzoadsmdrwwg.supabase.co/calendar" 
             style="background-color: #059669; 
                    color: white; 
                    text-decoration: none; 
                    padding: 12px 24px; 
                    border-radius: 6px; 
                    font-weight: 500; 
                    font-size: 14px; 
                    display: inline-block;">
            📅 Ver Calendario
          </a>
        </div>
        ` : ''}
      </div>
    `;

    return super.render({
      ...data,
      title: subject,
      content
    });
  }

  private getActionText(eventType: string): string {
    switch (eventType) {
      case 'created': return 'Se ha creado';
      case 'updated': return 'Se ha actualizado';
      case 'deleted': return 'Se ha cancelado';
      case 'reminder': return 'Recordatorio';
      default: return 'Se ha modificado';
    }
  }

  private getActionColor(eventType: string): string {
    switch (eventType) {
      case 'created': return '#059669';
      case 'updated': return '#0ea5e9';
      case 'deleted': return '#dc2626';
      case 'reminder': return '#ea580c';
      default: return '#6b7280';
    }
  }

  private getSubject(eventType: string, eventTitle: string): string {
    switch (eventType) {
      case 'created': return `Nuevo evento: ${eventTitle}`;
      case 'updated': return `Evento actualizado: ${eventTitle}`;
      case 'deleted': return `Evento cancelado: ${eventTitle}`;
      case 'reminder': return `Recordatorio: ${eventTitle}`;
      default: return `Evento: ${eventTitle}`;
    }
  }

  private getEventTypeLabel(eventType: string): string {
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

    return eventTypeMap[eventType] || eventType;
  }
}
