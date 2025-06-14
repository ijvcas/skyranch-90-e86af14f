
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

  // Exact replica of the authentic SkyRanch logo from Picture #2
  const logoSvg = `data:image/svg+xml;base64,${btoa(`
    <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <!-- Outer light green frame with rounded corners -->
        <rect x="5" y="5" width="110" height="110" rx="15" ry="15" fill="#a5c181" stroke="none"/>
        
        <!-- Inner dark green frame -->
        <rect x="12" y="12" width="96" height="84" rx="12" ry="12" fill="#1a472a" stroke="none"/>
        
        <!-- Light cream sky background -->
        <rect x="18" y="18" width="84" height="72" rx="8" ry="8" fill="#f5f5dc" stroke="none"/>
        
        <!-- Left cloud -->
        <ellipse cx="32" cy="32" rx="8" ry="5" fill="#1a472a"/>
        <ellipse cx="36" cy="30" rx="6" ry="4" fill="#1a472a"/>
        <ellipse cx="28" cy="29" rx="5" ry="3" fill="#1a472a"/>
        
        <!-- Right cloud -->
        <ellipse cx="88" cy="28" rx="7" ry="4" fill="#1a472a"/>
        <ellipse cx="92" cy="26" rx="5" ry="3" fill="#1a472a"/>
        <ellipse cx="84" cy="25" rx="4" ry="3" fill="#1a472a"/>
        
        <!-- Rolling hills in background (lightest green) -->
        <path d="M 18,75 Q 35,65 50,70 Q 65,75 80,68 Q 90,65 102,70 L 102,90 L 18,90 Z" fill="#8db061"/>
        
        <!-- Middle hills (medium green) -->
        <path d="M 18,80 Q 30,72 45,75 Q 60,78 75,72 Q 88,68 102,74 L 102,90 L 18,90 Z" fill="#6b8e23"/>
        
        <!-- Foreground hills (darkest green) -->
        <path d="M 18,85 Q 35,78 50,82 Q 65,86 80,80 Q 95,76 102,82 L 102,90 L 18,90 Z" fill="#556b2f"/>
        
        <!-- Donkey silhouette (left animal) -->
        <g transform="translate(35, 60)">
            <!-- Body -->
            <ellipse cx="8" cy="12" rx="6" ry="4" fill="#1a472a"/>
            <!-- Head -->
            <ellipse cx="2" cy="8" rx="3" ry="3" fill="#1a472a"/>
            <!-- Ears -->
            <ellipse cx="0" cy="6" rx="1" ry="2" fill="#1a472a"/>
            <ellipse cx="1" cy="5" rx="1" ry="2" fill="#1a472a"/>
            <!-- Legs -->
            <rect x="4" y="15" width="1" height="4" fill="#1a472a"/>
            <rect x="6" y="15" width="1" height="4" fill="#1a472a"/>
            <rect x="10" y="15" width="1" height="4" fill="#1a472a"/>
            <rect x="12" y="15" width="1" height="4" fill="#1a472a"/>
            <!-- Tail -->
            <ellipse cx="14" cy="10" rx="1" ry="2" fill="#1a472a"/>
        </g>
        
        <!-- Sheep silhouette (right animal) -->
        <g transform="translate(65, 62)">
            <!-- Woolly body -->
            <circle cx="6" cy="10" r="4" fill="#1a472a"/>
            <circle cx="3" cy="9" r="2" fill="#1a472a"/>
            <circle cx="9" cy="9" r="2" fill="#1a472a"/>
            <circle cx="6" cy="7" r="2" fill="#1a472a"/>
            <!-- Head -->
            <ellipse cx="1" cy="8" rx="2" ry="2" fill="#1a472a"/>
            <!-- Legs -->
            <rect x="3" y="13" width="1" height="3" fill="#1a472a"/>
            <rect x="5" y="13" width="1" height="3" fill="#1a472a"/>
            <rect x="7" y="13" width="1" height="3" fill="#1a472a"/>
            <rect x="9" y="13" width="1" height="3" fill="#1a472a"/>
        </g>
        
        <!-- SKY RANCH text at bottom -->
        <text x="60" y="108" text-anchor="middle" fill="#1a472a" font-family="Arial, sans-serif" font-size="9" font-weight="bold" letter-spacing="0.5">SKY RANCH</text>
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
