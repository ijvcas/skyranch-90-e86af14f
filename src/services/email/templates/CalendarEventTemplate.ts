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
    const gradientColor = this.getGradientColor(data.eventType);

    const content = `
      <!-- Enhanced Hero Section with Gradient Background -->
      <div style="background: linear-gradient(135deg, ${gradientColor} 0%, ${actionColor} 100%); padding: 0; margin: -32px -28px 32px -28px; position: relative; overflow: hidden;">
        <!-- Decorative elements -->
        <div style="position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%; opacity: 0.6;"></div>
        <div style="position: absolute; bottom: -30px; left: -30px; width: 120px; height: 120px; background: rgba(255,255,255,0.08); border-radius: 50%; opacity: 0.4;"></div>
        
        <div style="position: relative; z-index: 1; text-align: center; padding: 40px 28px;">
          <div style="display: inline-block; background: rgba(255,255,255,0.95); padding: 16px 24px; border-radius: 50px; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
            <span style="font-size: 24px; margin-right: 8px;">${actionIcon}</span>
            <span style="color: ${actionColor}; font-weight: 700; font-size: 16px; font-family: 'Playfair Display', Georgia, serif; text-transform: uppercase; letter-spacing: 1px;">NOTIFICACIÓN DE EVENTO</span>
          </div>
          <h2 style="color: #ffffff; margin: 0 0 8px 0; font-size: 24px; font-weight: 700; font-family: 'Playfair Display', Georgia, serif; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
            ${actionText.toUpperCase()}
          </h2>
          <div style="width: 60px; height: 2px; background: rgba(255,255,255,0.8); margin: 0 auto;"></div>
        </div>
      </div>

      <!-- Event Title with Enhanced Styling -->
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; background: linear-gradient(135deg, #f8fdf8 0%, #f0f9f0 100%); border: 3px solid ${actionColor}; padding: 24px 32px; border-radius: 20px; position: relative; box-shadow: 0 8px 25px rgba(0,0,0,0.1);">
          <!-- Corner decorations -->
          <div style="position: absolute; top: -3px; left: -3px; width: 12px; height: 12px; background: ${actionColor}; border-radius: 50%;"></div>
          <div style="position: absolute; top: -3px; right: -3px; width: 12px; height: 12px; background: ${actionColor}; border-radius: 50%;"></div>
          <div style="position: absolute; bottom: -3px; left: -3px; width: 12px; height: 12px; background: ${actionColor}; border-radius: 50%;"></div>
          <div style="position: absolute; bottom: -3px; right: -3px; width: 12px; height: 12px; background: ${actionColor}; border-radius: 50%;"></div>
          
          <h3 style="margin: 0; font-size: 28px; font-weight: 700; color: #047857; font-family: 'Playfair Display', Georgia, serif; line-height: 1.2; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">
            ${data.event.title}
          </h3>
          <p style="margin: 12px 0 0 0; color: ${actionColor}; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
            ${actionText}
          </p>
        </div>
      </div>

      <!-- Personal Greeting with Enhanced Typography -->
      <div style="margin-bottom: 32px; padding: 0 8px;">
        <p style="color: #374151; font-size: 18px; margin-bottom: 12px; font-weight: 600; font-family: 'Playfair Display', Georgia, serif;">
          Estimado/a ${data.userName || 'Usuario'},
        </p>
        
        <p style="color: #6b7280; font-size: 16px; margin-bottom: 0; line-height: 1.8; font-weight: 400;">
          Te informamos que el evento <strong style="color: #047857; font-weight: 700;">"${data.event.title}"</strong> ${actionText.toLowerCase()} 
          en el sistema de gestión ganadera SkyRanch.
        </p>
      </div>

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
            <!-- Title Row -->
            <div style="display: flex; align-items: flex-start; padding: 16px; background: linear-gradient(135deg, #ffffff 0%, #f0f9f0 100%); border-radius: 12px; border-left: 5px solid #059669; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
              <div style="background: #059669; color: white; padding: 8px; border-radius: 8px; margin-right: 16px; font-weight: 700; font-size: 14px; min-width: 60px; text-align: center;">📝</div>
              <div>
                <strong style="color: #047857; display: block; font-size: 14px; font-weight: 700; margin-bottom: 4px;">Título:</strong>
                <span style="color: #374151; font-size: 16px; font-weight: 600;">${data.event.title}</span>
              </div>
            </div>
            
            ${data.event.eventType ? `
            <div style="display: flex; align-items: flex-start; padding: 16px; background: linear-gradient(135deg, #ffffff 0%, #f0f9f0 100%); border-radius: 12px; border-left: 5px solid #0ea5e9; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
              <div style="background: #0ea5e9; color: white; padding: 8px; border-radius: 8px; margin-right: 16px; font-weight: 700; font-size: 14px; min-width: 60px; text-align: center;">🏷️</div>
              <div>
                <strong style="color: #047857; display: block; font-size: 14px; font-weight: 700; margin-bottom: 4px;">Tipo:</strong>
                <span style="color: #374151; font-size: 16px; font-weight: 600; background: linear-gradient(135deg, #0ea5e9, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${this.getEventTypeLabel(data.event.eventType)}</span>
              </div>
            </div>
            ` : ''}
            
            <!-- Date Row with Special Emphasis -->
            <div style="display: flex; align-items: flex-start; padding: 16px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; border-left: 5px solid #f59e0b; box-shadow: 0 2px 8px rgba(245, 158, 11, 0.2);">
              <div style="background: #f59e0b; color: white; padding: 8px; border-radius: 8px; margin-right: 16px; font-weight: 700; font-size: 14px; min-width: 60px; text-align: center;">📅</div>
              <div>
                <strong style="color: #92400e; display: block; font-size: 14px; font-weight: 700; margin-bottom: 4px;">Fecha y Hora:</strong>
                <span style="color: #374151; font-size: 16px; font-weight: 700; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">${eventDate}</span>
              </div>
            </div>
            
            ${data.event.description ? `
            <div style="display: flex; align-items: flex-start; padding: 16px; background: linear-gradient(135deg, #ffffff 0%, #f0f9f0 100%); border-radius: 12px; border-left: 5px solid #8b5cf6; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
              <div style="background: #8b5cf6; color: white; padding: 8px; border-radius: 8px; margin-right: 16px; font-weight: 700; font-size: 14px; min-width: 60px; text-align: center;">📄</div>
              <div>
                <strong style="color: #047857; display: block; font-size: 14px; font-weight: 700; margin-bottom: 4px;">Descripción:</strong>
                <span style="color: #374151; font-size: 15px; line-height: 1.6; font-weight: 400;">${data.event.description}</span>
              </div>
            </div>
            ` : ''}
            
            ${data.event.location ? `
            <div style="display: flex; align-items: flex-start; padding: 16px; background: linear-gradient(135deg, #ffffff 0%, #f0f9f0 100%); border-radius: 12px; border-left: 5px solid #ef4444; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
              <div style="background: #ef4444; color: white; padding: 8px; border-radius: 8px; margin-right: 16px; font-weight: 700; font-size: 14px; min-width: 60px; text-align: center;">📍</div>
              <div>
                <strong style="color: #047857; display: block; font-size: 14px; font-weight: 700; margin-bottom: 4px;">Ubicación:</strong>
                <span style="color: #374151; font-size: 15px; font-weight: 500;">${data.event.location}</span>
              </div>
            </div>
            ` : ''}
            
            ${data.event.veterinarian ? `
            <div style="display: flex; align-items: flex-start; padding: 16px; background: linear-gradient(135deg, #ffffff 0%, #f0f9f0 100%); border-radius: 12px; border-left: 5px solid #10b981; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
              <div style="background: #10b981; color: white; padding: 8px; border-radius: 8px; margin-right: 16px; font-weight: 700; font-size: 14px; min-width: 60px; text-align: center;">👨‍⚕️</div>
              <div>
                <strong style="color: #047857; display: block; font-size: 14px; font-weight: 700; margin-bottom: 4px;">Veterinario:</strong>
                <span style="color: #374151; font-size: 15px; font-weight: 500;">${data.event.veterinarian}</span>
              </div>
            </div>
            ` : ''}
          </div>
        </div>
      </div>

      ${data.eventType !== 'deleted' ? `
      <!-- Premium Call to Action -->
      <div style="text-align: center; margin: 40px 0; padding: 32px; background: linear-gradient(135deg, #ffffff 0%, #f8fdf8 100%); border-radius: 20px; border: 2px solid #e5f3e5; position: relative; overflow: hidden; box-shadow: 0 10px 30px rgba(4, 120, 87, 0.1);">
        <!-- Background decoration -->
        <div style="position: absolute; top: -50px; left: -50px; width: 100px; height: 100px; background: linear-gradient(45deg, #059669, #10b981); border-radius: 50%; opacity: 0.1;"></div>
        <div style="position: absolute; bottom: -50px; right: -50px; width: 100px; height: 100px; background: linear-gradient(45deg, #047857, #059669); border-radius: 50%; opacity: 0.1;"></div>
        
        <div style="position: relative; z-index: 1;">
          <div style="margin-bottom: 24px;">
            <span style="font-size: 32px; display: block; margin-bottom: 12px;">🌟</span>
            <p style="color: #6b7280; font-size: 16px; margin-bottom: 8px; font-weight: 500; font-family: 'Playfair Display', Georgia, serif;">
              Accede al sistema para gestionar todos tus eventos ganaderos
            </p>
            <p style="color: #9ca3af; font-size: 14px; margin-bottom: 0; font-style: italic;">
              Gestión profesional y eficiente de tu ganado
            </p>
          </div>
          
          <a href="https://id-preview--d956216c-86a1-4ff3-9df4-bdfbbabf459a.lovable.app/calendar" 
             style="display: inline-block; background: linear-gradient(135deg, #047857 0%, #059669 50%, #10b981 100%); 
                    color: white; 
                    text-decoration: none; 
                    padding: 16px 40px; 
                    border-radius: 50px; 
                    font-weight: 700; 
                    font-size: 16px; 
                    box-shadow: 0 8px 25px rgba(5, 150, 105, 0.4);
                    transition: all 0.3s ease;
                    border: 2px solid transparent;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    font-family: 'Inter', sans-serif;">
             <span style="margin-right: 8px;">📅</span>
             Ver Calendario Completo
          </a>
          
          <p style="color: #9ca3af; font-size: 12px; margin: 20px 0 0 0; font-style: italic;">
            Tecnología avanzada para el manejo eficiente de ganado
          </p>
        </div>
      </div>
      ` : ''}
    `;

    return super.render({
      ...data,
      title: subject,
      content
    });
  }

  private getGradientColor(eventType: string): string {
    switch (eventType) {
      case 'created': return '#10b981';
      case 'updated': return '#06b6d4';
      case 'deleted': return '#f87171';
      case 'reminder': return '#fbbf24';
      default: return '#9ca3af';
    }
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
