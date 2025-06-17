
import { CalendarEventData } from '../CalendarEventTemplate';

export class EventDetailsCard {
  static render(data: CalendarEventData, eventDate: string): string {
    return `
      <!-- Premium Event Details Card -->
      <div style="background: linear-gradient(135deg, #ffffff 0%, #f8fdf8 100%); border: 2px solid #e5f3e5; border-radius: 20px; padding: 28px; margin-bottom: 32px; position: relative; overflow: hidden; box-shadow: 0 10px 30px rgba(4, 120, 87, 0.1);">
        <!-- Premium background pattern -->
        <div style="position: absolute; top: 0; right: 0; width: 150px; height: 150px; background: url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><circle cx=\"50\" cy=\"50\" r=\"25\" fill=\"none\" stroke=\"%23059669\" stroke-width=\"1\" opacity=\"0.1\"/><circle cx=\"50\" cy=\"50\" r=\"15\" fill=\"none\" stroke=\"%23059669\" stroke-width=\"1\" opacity=\"0.15\"/><circle cx=\"50\" cy=\"50\" r=\"5\" fill=\"%23059669\" opacity=\"0.1\"/></svg>'); opacity: 0.6;"></div>
        
        <div style="position: relative; z-index: 1;">
          <!-- Enhanced header with gradient -->
          <div style="background: linear-gradient(135deg, #047857 0%, #059669 100%); color: #ffffff; padding: 16px 24px; border-radius: 12px; margin: -28px -28px 24px -28px; box-shadow: 0 4px 15px rgba(4, 120, 87, 0.3);">
            <h4 style="margin: 0; font-size: 20px; font-weight: 700; font-family: 'Playfair Display', Georgia, serif; display: flex; align-items: center;">
              <span style="margin-right: 12px; font-size: 24px;">📋</span>
              Detalles del Evento
            </h4>
          </div>
          
          <div style="display: grid; gap: 18px;">
            ${this.renderEventDetail('📝', 'Título', data.event.title, '#059669')}
            
            ${data.event.eventType ? this.renderEventDetail('🏷️', 'Tipo', this.getEventTypeLabel(data.event.eventType), '#0ea5e9') : ''}
            
            ${this.renderEventDetail('📅', 'Fecha y Hora', eventDate, '#f59e0b', true)}
            
            ${data.event.description ? this.renderEventDetail('📄', 'Descripción', data.event.description, '#8b5cf6') : ''}
            
            ${data.event.location ? this.renderEventDetail('📍', 'Ubicación', data.event.location, '#ef4444') : ''}
            
            ${data.event.veterinarian ? this.renderEventDetail('👨‍⚕️', 'Veterinario', data.event.veterinarian, '#10b981') : ''}
          </div>
        </div>
      </div>
    `;
  }

  private static renderEventDetail(icon: string, label: string, value: string, color: string, isDate: boolean = false): string {
    const bgColor = isDate ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' : 'linear-gradient(135deg, #ffffff 0%, #f0f9f0 100%)';
    const textColor = isDate ? '#92400e' : '#374151';
    const fontWeight = isDate ? '700' : '600';
    
    return `
      <div style="display: flex; align-items: flex-start; padding: 16px; background: ${bgColor}; border-radius: 12px; border-left: 5px solid ${color}; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        <div style="background: ${color}; color: white; padding: 8px; border-radius: 8px; margin-right: 16px; font-weight: 700; font-size: 14px; min-width: 60px; text-align: center;">${icon}</div>
        <div>
          <strong style="color: #047857; display: block; font-size: 14px; font-weight: 700; margin-bottom: 4px;">${label}:</strong>
          <span style="color: ${textColor}; font-size: ${isDate ? '16px' : '15px'}; font-weight: ${fontWeight}; ${isDate ? 'text-shadow: 0 1px 2px rgba(0,0,0,0.1);' : ''}">${value}</span>
        </div>
      </div>
    `;
  }

  private static getEventTypeLabel(eventType: string): string {
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
