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

  // Authentic SkyRanch logo with donkey, sheep, clouds, and landscape
  const logoSvg = `data:image/svg+xml;base64,${btoa(`
    <svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <!-- Background rounded square with gradient -->
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#4ade80;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#22c55e;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#16a34a;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="80" height="80" rx="12" fill="url(#bgGradient)"/>
      
      <!-- Clouds -->
      <ellipse cx="20" cy="18" rx="8" ry="4" fill="white" opacity="0.7"/>
      <ellipse cx="60" cy="15" rx="6" ry="3" fill="white" opacity="0.6"/>
      <ellipse cx="45" cy="20" rx="5" ry="2.5" fill="white" opacity="0.5"/>
      
      <!-- Rolling hills landscape -->
      <path d="M0 55 Q20 45, 40 55 Q60 50, 80 55 L80 80 L0 80 Z" fill="#166534" opacity="0.8"/>
      <path d="M0 60 Q15 50, 30 60 Q50 55, 80 60 L80 80 L0 80 Z" fill="#15803d" opacity="0.6"/>
      
      <!-- Donkey silhouette (left) -->
      <g transform="translate(12, 30)">
        <!-- Donkey body -->
        <ellipse cx="8" cy="12" rx="6" ry="4" fill="#374151"/>
        <!-- Donkey head -->
        <ellipse cx="3" cy="8" rx="3" ry="2.5" fill="#374151"/>
        <!-- Long ears -->
        <ellipse cx="1" cy="6" rx="1.5" ry="3" fill="#374151"/>
        <ellipse cx="5" cy="6" rx="1.5" ry="3" fill="#374151"/>
        <!-- Legs -->
        <rect x="4" y="15" width="1.5" height="6" fill="#374151"/>
        <rect x="7" y="15" width="1.5" height="6" fill="#374151"/>
        <rect x="10" y="15" width="1.5" height="6" fill="#374151"/>
        <rect x="13" y="15" width="1.5" height="6" fill="#374151"/>
        <!-- Tail -->
        <path d="M14 10 Q16 12, 15 15" stroke="#374151" stroke-width="1.5" fill="none"/>
      </g>
      
      <!-- Sheep silhouette (right) -->
      <g transform="translate(50, 32)">
        <!-- Fluffy sheep body -->
        <circle cx="6" cy="10" r="5" fill="white" opacity="0.9"/>
        <circle cx="3" cy="8" r="2.5" fill="white" opacity="0.9"/>
        <circle cx="9" cy="8" r="2.5" fill="white" opacity="0.9"/>
        <circle cx="6" cy="6" r="3" fill="white" opacity="0.9"/>
        <!-- Sheep head (darker) -->
        <ellipse cx="1" cy="8" rx="2" ry="1.5" fill="#374151"/>
        <!-- Legs -->
        <rect x="3" y="14" width="1.2" height="5" fill="#374151"/>
        <rect x="5.5" y="14" width="1.2" height="5" fill="#374151"/>
        <rect x="8" y="14" width="1.2" height="5" fill="#374151"/>
        <rect x="10.5" y="14" width="1.2" height="5" fill="#374151"/>
      </g>
      
      <!-- SKY RANCH text at bottom -->
      <text x="40" y="72" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="8" font-weight="bold" letter-spacing="1px">SKY RANCH</text>
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
          <img src="${logoSvg}" alt="SkyRanch Logo" style="width: 80px; height: 80px; margin-bottom: 16px;">
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
