
// Email template generation utilities
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

  const actionColor = eventType === 'deleted' ? '#dc2626' : '#059669';

  // Authentic SkyRanch logo recreated as SVG from the provided reference image
  const logoSvg = `data:image/svg+xml;base64,${btoa(`
    <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <!-- Outer frame with light green gradient -->
      <defs>
        <linearGradient id="outerFrame" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#86efac;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#4ade80;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="innerFrame" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#22c55e;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#16a34a;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#bfdbfe;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#93c5fd;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Outer rounded frame -->
      <rect width="120" height="120" rx="15" fill="url(#outerFrame)" stroke="#16a34a" stroke-width="2"/>
      
      <!-- Inner rounded frame -->
      <rect x="8" y="8" width="104" height="104" rx="12" fill="url(#innerFrame)"/>
      
      <!-- Sky background -->
      <rect x="12" y="12" width="96" height="60" rx="8" fill="url(#skyGradient)"/>
      
      <!-- Clouds -->
      <g opacity="0.8">
        <!-- Left cloud -->
        <circle cx="25" cy="25" r="6" fill="white"/>
        <circle cx="30" cy="25" r="8" fill="white"/>
        <circle cx="35" cy="25" r="6" fill="white"/>
        <!-- Right cloud -->
        <circle cx="85" cy="30" r="5" fill="white"/>
        <circle cx="90" cy="30" r="7" fill="white"/>
        <circle cx="95" cy="30" r="5" fill="white"/>
      </g>
      
      <!-- Rolling hills landscape with proper layering -->
      <path d="M12 55 Q30 45, 50 55 Q70 50, 85 55 Q95 52, 108 55 L108 72 L12 72 Z" fill="#15803d"/>
      <path d="M12 60 Q25 52, 40 60 Q60 55, 80 60 Q95 58, 108 60 L108 72 L12 72 Z" fill="#16a34a"/>
      <path d="M12 65 Q35 60, 60 65 Q85 62, 108 65 L108 72 L12 72 Z" fill="#22c55e"/>
      
      <!-- Donkey silhouette (left side) -->
      <g transform="translate(20, 40)">
        <!-- Body -->
        <ellipse cx="12" cy="18" rx="8" ry="5" fill="#1f2937"/>
        <!-- Head -->
        <ellipse cx="4" cy="12" rx="4" ry="3" fill="#1f2937"/>
        <!-- Long ears -->
        <ellipse cx="1" cy="8" rx="2" ry="4" fill="#1f2937"/>
        <ellipse cx="7" cy="8" rx="2" ry="4" fill="#1f2937"/>
        <!-- Legs -->
        <rect x="6" y="22" width="2" height="8" fill="#1f2937"/>
        <rect x="10" y="22" width="2" height="8" fill="#1f2937"/>
        <rect x="14" y="22" width="2" height="8" fill="#1f2937"/>
        <rect x="18" y="22" width="2" height="8" fill="#1f2937"/>
        <!-- Tail -->
        <path d="M20 15 Q23 18, 22 22" stroke="#1f2937" stroke-width="2" fill="none"/>
        <!-- Mane -->
        <path d="M4 8 Q6 6, 8 8" stroke="#1f2937" stroke-width="2" fill="none"/>
      </g>
      
      <!-- Sheep silhouette (right side) -->
      <g transform="translate(65, 42)">
        <!-- Fluffy body with multiple circles for wool texture -->
        <circle cx="8" cy="16" r="6" fill="white"/>
        <circle cx="4" cy="14" r="3" fill="white"/>
        <circle cx="12" cy="14" r="3" fill="white"/>
        <circle cx="6" cy="12" r="3" fill="white"/>
        <circle cx="10" cy="12" r="3" fill="white"/>
        <circle cx="8" cy="10" r="3" fill="white"/>
        <!-- Head (dark) -->
        <ellipse cx="2" cy="12" rx="2.5" ry="2" fill="#1f2937"/>
        <!-- Legs -->
        <rect x="5" y="21" width="1.5" height="7" fill="#1f2937"/>
        <rect x="7.5" y="21" width="1.5" height="7" fill="#1f2937"/>
        <rect x="10" y="21" width="1.5" height="7" fill="#1f2937"/>
        <rect x="12.5" y="21" width="1.5" height="7" fill="#1f2937"/>
      </g>
      
      <!-- Text area background -->
      <rect x="12" y="78" width="96" height="22" rx="4" fill="#16a34a"/>
      
      <!-- SKY RANCH text -->
      <text x="60" y="92" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="12" font-weight="bold" letter-spacing="1.5px">SKY RANCH</text>
    </svg>
  `)}`;

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; line-height: 1.5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        
        <!-- Logo Section -->
        <div style="text-align: center; padding: 32px 24px 24px 24px; background-color: #ffffff;">
          <img src="${logoSvg}" alt="SkyRanch Logo" style="width: 120px; height: 120px; margin-bottom: 16px; border-radius: 12px;">
          <h1 style="margin: 0; font-size: 32px; font-weight: 300; letter-spacing: 1px; color: #047857; font-family: 'Georgia', serif;">
            SKYRANCH
          </h1>
          <div style="width: 40px; height: 1px; background-color: #059669; margin: 12px auto;"></div>
          <p style="margin: 8px 0 0 0; font-size: 12px; color: #6b7280; letter-spacing: 0.5px; text-transform: uppercase;">
            Sistema de Gestión Ganadera
          </p>
        </div>

        <!-- Centered Header -->
        <div style="display: flex; justify-content: center; padding: 0 24px;">
          <div style="background-color: #059669; padding: 16px 32px; border-radius: 8px; text-align: center; max-width: 400px;">
            <h2 style="color: #ffffff; margin: 0 0 4px 0; font-size: 16px; font-weight: 500;">
              SKYRANCH
            </h2>
            <p style="color: #ecfdf5; margin: 0; font-size: 12px; font-weight: 400;">
              Notificación de Evento
            </p>
          </div>
        </div>

        <!-- Centered Event Status -->
        <div style="padding: 16px 24px; display: flex; justify-content: center;">
          <div style="background-color: ${actionColor}; color: white; padding: 12px 24px; border-radius: 6px; text-align: center; max-width: 400px;">
            <h3 style="margin: 0; font-size: 14px; font-weight: 500;">
              ${subject}
            </h3>
          </div>
        </div>

        <!-- Content -->
        <div style="padding: 0 24px 32px 24px;">
          <p style="color: #374151; font-size: 16px; margin-bottom: 20px; font-weight: 500;">
            Hola ${userName},
          </p>
          
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 24px; line-height: 1.6;">
            Te informamos que el evento <strong>${event.title}</strong> ${actionText} en el sistema.
          </p>

          <!-- Event Details Card -->
          <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <h4 style="color: #111827; margin: 0 0 16px 0; font-size: 16px; font-weight: 600; border-bottom: 1px solid #d1d5db; padding-bottom: 8px;">
              📋 Detalles del Evento
            </h4>
            
            <div style="margin-bottom: 12px;">
              <strong style="color: #374151; display: inline-block; width: 100px; font-size: 13px;">Título:</strong>
              <span style="color: #6b7280; font-size: 13px;">${event.title}</span>
            </div>
            
            <div style="margin-bottom: 12px;">
              <strong style="color: #374151; display: inline-block; width: 100px; font-size: 13px;">Tipo:</strong>
              <span style="color: #6b7280; font-size: 13px;">${eventTitle}</span>
            </div>
            
            <div style="margin-bottom: 12px;">
              <strong style="color: #374151; display: inline-block; width: 100px; font-size: 13px;">Fecha:</strong>
              <span style="color: #6b7280; font-size: 13px;">${eventDate}</span>
            </div>
            
            ${event.description ? `
            <div style="margin-bottom: 12px;">
              <strong style="color: #374151; display: inline-block; width: 100px; font-size: 13px;">Descripción:</strong>
              <span style="color: #6b7280; font-size: 13px;">${event.description}</span>
            </div>
            ` : ''}
            
            ${event.location ? `
            <div style="margin-bottom: 12px;">
              <strong style="color: #374151; display: inline-block; width: 100px; font-size: 13px;">Ubicación:</strong>
              <span style="color: #6b7280; font-size: 13px;">${event.location}</span>
            </div>
            ` : ''}
          </div>

          ${eventType !== 'deleted' ? `
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

        <!-- Clean Footer -->
        <div style="background-color: #f9fafb; padding: 20px 24px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="color: #6b7280; margin: 0 0 12px 0; font-size: 12px; line-height: 1.4;">
            Este es un mensaje automático del sistema <strong>${organizationName}</strong>.<br>
            Por favor, no respondas a este correo electrónico.
          </p>
          <p style="color: #9ca3af; margin: 0; font-size: 11px;">
            © ${new Date().getFullYear()} ${organizationName} - Sistema de Gestión Ganadera
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};
