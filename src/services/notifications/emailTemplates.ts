
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

  // Use the actual SkyRanch logo image that was provided
  const logoUrl = "https://ahwhtxygyzoadsmdrwwg.supabase.co/storage/v1/object/public/lovable-uploads/953e2699-9daf-4fea-86c8-e505a1e54eb3.png";

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
          <img src="${logoUrl}" alt="SkyRanch Logo" style="width: 120px; height: 120px; margin-bottom: 16px; border-radius: 12px;">
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
