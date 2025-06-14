
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

  // Exact replica of the authentic SkyRanch logo as SVG
  const logoSvg = `data:image/svg+xml;base64,${btoa(`
    <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <!-- Bright lime green outer frame -->
      <rect width="120" height="120" rx="12" fill="#32cd32" stroke="#228b22" stroke-width="1"/>
      
      <!-- Darker green inner frame -->
      <rect x="6" y="6" width="108" height="108" rx="8" fill="#228b22"/>
      
      <!-- Simple light blue sky -->
      <rect x="10" y="10" width="100" height="55" rx="4" fill="#87ceeb"/>
      
      <!-- Two simple white clouds -->
      <!-- Left cloud -->
      <g opacity="0.9">
        <circle cx="30" cy="25" r="4" fill="white"/>
        <circle cx="35" cy="25" r="6" fill="white"/>
        <circle cx="40" cy="25" r="4" fill="white"/>
      </g>
      <!-- Right cloud -->
      <g opacity="0.9">
        <circle cx="80" cy="30" r="3.5" fill="white"/>
        <circle cx="85" cy="30" r="5" fill="white"/>
        <circle cx="90" cy="30" r="3.5" fill="white"/>
      </g>
      
      <!-- Simple rolling hills in two layers -->
      <!-- Back hills -->
      <path d="M10 50 Q30 42, 50 50 Q70 45, 90 50 Q100 48, 110 50 L110 65 L10 65 Z" fill="#228b22"/>
      <!-- Front hills -->
      <path d="M10 55 Q35 48, 60 55 Q85 50, 110 55 L110 65 L10 65 Z" fill="#32cd32"/>
      
      <!-- Donkey silhouette (left side, simplified) -->
      <g transform="translate(25, 35)">
        <!-- Body -->
        <ellipse cx="8" cy="15" rx="6" ry="4" fill="#2c2c2c"/>
        <!-- Head -->
        <ellipse cx="2" cy="10" rx="3" ry="2.5" fill="#2c2c2c"/>
        <!-- Long ears -->
        <ellipse cx="0" cy="7" rx="1.5" ry="3" fill="#2c2c2c"/>
        <ellipse cx="4" cy="7" rx="1.5" ry="3" fill="#2c2c2c"/>
        <!-- Legs -->
        <rect x="4" y="18" width="1.5" height="6" fill="#2c2c2c"/>
        <rect x="6.5" y="18" width="1.5" height="6" fill="#2c2c2c"/>
        <rect x="9" y="18" width="1.5" height="6" fill="#2c2c2c"/>
        <rect x="11.5" y="18" width="1.5" height="6" fill="#2c2c2c"/>
        <!-- Tail -->
        <path d="M14 13 Q16 15, 15 18" stroke="#2c2c2c" stroke-width="1.5" fill="none"/>
      </g>
      
      <!-- Sheep silhouette (right side, fluffy white body) -->
      <g transform="translate(70, 37)">
        <!-- Fluffy white body -->
        <circle cx="6" cy="13" r="4.5" fill="white"/>
        <circle cx="3" cy="11" r="2.5" fill="white"/>
        <circle cx="9" cy="11" r="2.5" fill="white"/>
        <circle cx="4.5" cy="9" r="2" fill="white"/>
        <circle cx="7.5" cy="9" r="2" fill="white"/>
        <!-- Dark head -->
        <ellipse cx="1" cy="10" rx="2" ry="1.5" fill="#2c2c2c"/>
        <!-- Legs -->
        <rect x="3.5" y="16.5" width="1" height="5" fill="#2c2c2c"/>
        <rect x="5.5" y="16.5" width="1" height="5" fill="#2c2c2c"/>
        <rect x="7.5" y="16.5" width="1" height="5" fill="#2c2c2c"/>
        <rect x="9.5" y="16.5" width="1" height="5" fill="#2c2c2c"/>
      </g>
      
      <!-- Green text background bar -->
      <rect x="10" y="75" width="100" height="20" rx="3" fill="#228b22"/>
      
      <!-- SKY RANCH text in white -->
      <text x="60" y="88" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="11" font-weight="bold" letter-spacing="1px">SKY RANCH</text>
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
