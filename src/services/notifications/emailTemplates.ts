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
    <svg width="120" height="120" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <!-- Outer frame & text background -->
        <rect width="100" height="100" rx="10" fill="#a5c181" />
        
        <!-- Inner dark frame -->
        <rect x="4" y="4" width="92" height="80" rx="8" fill="#254d2f" />
        
        <!-- Sky area -->
        <rect x="7" y="7" width="86" height="74" rx="5" fill="#e6f3d6" />
        
        <!-- Hills -->
        <path d="M 7,81 C 25,68 35,70 50,63 C 65,56 75,63 93,58 V 81 H 7 Z" fill="#8db061" />
        <path d="M 7,81 C 20,76 30,78 45,70 C 60,62 80,68 93,64 V 81 H 7 Z" fill="#739a47" />
        <path d="M 7,81 C 15,80 25,81 40,74 C 55,67 75,76 93,70 V 81 H 7 Z" fill="#5a7f2f" />
        
        <!-- Clouds -->
        <path d="M22,25 C19,25 18,22 21,21 C24,20 28,21 28,24 C28,27 25,28 22,25 Z" fill="#254d2f"/>
        <path d="M70,23 C67,23 66,20 69,19 C72,18 76,19 76,22 C76,25 73,26 70,23 Z" fill="#254d2f"/>
        
        <!-- Donkey -->
        <g transform="translate(18 45) scale(0.9)">
            <path d="M 10,12 L 12,8 L 11,6 L 13,6 L 15,10 L 18,10 C 20,10 22,12 22,15 L 22,20 L 19,20 L 19,23 L 17,23 L 17,20 L 12,20 L 12,23 L 10,23 L 10,20 L 7,20 L 7,15 C 7,12 8,10 10,10 Z" fill="#254d2f"/>
        </g>
        
        <!-- Sheep -->
        <g transform="translate(60 47) scale(0.9)">
            <path d="M 10,12 C 7,12 7,15 10,15 L 10,18 L 13,18 C 16,18 16,15 13,15 C 13,12 16,12 16,15 L 18,12 L 19,15 C 21,15 21,18 18,18 L 10,18 L 10,22 L 8,22 L 8,18 L 5,18 C 2,18 2,15 5,15 L 8,12 Z" fill="#254d2f"/>
        </g>
        
        <!-- Text -->
        <text x="50" y="93" text-anchor="middle" fill="#254d2f" font-family="Arial, sans-serif" font-size="8" font-weight="bold">SKY RANCH</text>
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
