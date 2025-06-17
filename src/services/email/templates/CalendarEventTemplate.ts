
import { EmailContent } from '../interfaces/EmailTypes';
import { BaseEmailTemplate, BaseTemplateData } from './BaseEmailTemplate';
import { EmailHeader } from './components/EmailHeader';
import { EventHeroSection } from './components/EventHeroSection';
import { EventDetailsCard } from './components/EventDetailsCard';
import { CallToActionSection } from './components/CallToActionSection';

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
    console.log('🎨 [CALENDAR EMAIL TEMPLATE] Rendering enhanced branded email template');
    
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
      ${EventHeroSection.render(data.eventType, actionText, actionColor, actionIcon, gradientColor, data.event.title)}

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

      ${EventDetailsCard.render(data, eventDate)}

      ${CallToActionSection.render(data.eventType)}
    `;

    console.log('✅ [CALENDAR EMAIL TEMPLATE] Enhanced branded template rendered successfully');

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
}
