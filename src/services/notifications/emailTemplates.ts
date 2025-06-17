
// Email template generation utilities with clean SkyRanch branding
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

  const subject = `${eventType === 'created' ? '✨ Nuevo evento' : 
                   eventType === 'updated' ? '🔄 Evento actualizado' : 
                   eventType === 'deleted' ? '❌ Evento cancelado' : '🔔 Recordatorio'}: ${event.title}`;

  const actionText = eventType === 'created' ? 'se ha creado exitosamente' : 
                     eventType === 'updated' ? 'se ha actualizado correctamente' : 
                     eventType === 'deleted' ? 'se ha cancelado' : 'está próximo';

  const actionColor = eventType === 'deleted' ? '#dc2626' : '#10b981';
  const actionBgColor = eventType === 'deleted' ? '#fef2f2' : '#f0fdf4';

  const logoUrl = "/lovable-uploads/953e2699-9daf-4fea-86c8-e505a1e54eb3.png";

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 20px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; background: #f8fafc; line-height: 1.6; color: #334155;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 16px rgba(0,0,0,0.1); border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
        
        <!-- Clean SkyRanch Header -->
        <div style="background: linear-gradient(135deg, #10b981 0%, #34d399 25%, #6ee7b7 75%, #a7f3d0 100%); padding: 40px 24px; text-align: center; position: relative; overflow: hidden;">
          <!-- Subtle background pattern -->
          <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"80\" height=\"80\" viewBox=\"0 0 80 80\"%3E%3Ccircle cx=\"40\" cy=\"40\" r=\"2\" fill=\"%23ffffff\" opacity=\"0.08\"/%3E%3Ccircle cx=\"15\" cy=\"15\" r=\"1.5\" fill=\"%23ffffff\" opacity=\"0.12\"/%3E%3Ccircle cx=\"65\" cy=\"65\" r=\"1.5\" fill=\"%23ffffff\" opacity=\"0.12\"/%3E%3C/svg%3E'); opacity: 0.4;"></div>
          
          <!-- Logo -->
          <div style="position: relative; z-index: 1;">
            <div style="display: inline-block; margin-bottom: 16px; padding: 8px; background: rgba(255,255,255,0.15); border-radius: 16px; border: 2px solid rgba(255,255,255,0.2);">
              <img src="${logoUrl}" alt="SkyRanch Logo" style="width: 60px; height: 60px; border-radius: 12px; display: block;">
            </div>
            
            <!-- Brand Title -->
            <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700; color: #ffffff; font-family: 'Inter', sans-serif; text-shadow: 0 2px 4px rgba(0,0,0,0.2); letter-spacing: 1px;">
              SKYRANCH
            </h1>
            
            <!-- Divider -->
            <div style="width: 60px; height: 1px; background: rgba(255,255,255,0.6); margin: 12px auto;"></div>
            
            <!-- Subtitle -->
            <p style="margin: 0; font-size: 11px; color: rgba(255,255,255,0.9); letter-spacing: 0.5px; text-transform: uppercase; font-weight: 500;">
              Sistema de Gestión Ganadera
            </p>
          </div>
        </div>

        <!-- Event Notification Banner -->
        <div style="padding: 24px; text-align: center; background: ${actionBgColor}; border-bottom: 1px solid ${actionColor}20;">
          <div style="display: inline-block; background: ${actionColor}; color: white; padding: 12px 24px; border-radius: 8px; box-shadow: 0 2px 8px ${actionColor}40;">
            <h2 style="margin: 0; font-size: 16px; font-weight: 600; letter-spacing: 0.3px;">
              SKYRANCH
            </h2>
            <p style="margin: 4px 0 0 0; font-size: 14px; font-weight: 500;">
              Notificación de Evento
            </p>
          </div>
        </div>

        <!-- Event Status -->
        <div style="padding: 20px 24px; text-align: center; background: #f9fafb;">
          <div style="display: inline-block; background: ${actionColor}; color: white; padding: 10px 20px; border-radius: 20px;">
            <h3 style="margin: 0; font-size: 14px; font-weight: 600;">
              Evento ${eventType === 'updated' ? 'actualizado' : eventType === 'created' ? 'creado' : eventType === 'deleted' ? 'cancelado' : 'recordatorio'}: ${event.title}
            </h3>
          </div>
        </div>

        <!-- Main Content -->
        <div style="padding: 32px 24px;">
          <!-- Greeting -->
          <p style="color: #10b981; font-size: 16px; font-weight: 600; margin: 0 0 16px 0;">
            Hola ${userName} 👋
          </p>
          <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px 0; line-height: 1.5;">
            Te informamos que el evento <strong style="color: #10b981;">${event.title}</strong> ${actionText} en el sistema.
          </p>

          <!-- Event Details Card -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; margin-bottom: 16px;">
              <div style="width: 32px; height: 32px; background: ${actionColor}; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                <span style="color: #ffffff; font-size: 16px;">📋</span>
              </div>
              <h4 style="color: #374151; margin: 0; font-size: 16px; font-weight: 600;">
                Detalles del Evento
              </h4>
            </div>
            
            <div style="space-y: 12px;">
              <div style="margin-bottom: 12px; padding: 8px 12px; background: #ffffff; border-radius: 6px; border-left: 3px solid #10b981;">
                <span style="color: #6b7280; font-size: 11px; font-weight: 600; text-transform: uppercase; display: block; margin-bottom: 2px;">Título</span>
                <span style="color: #1f2937; font-size: 13px; font-weight: 600;">${event.title}</span>
              </div>
              
              <div style="margin-bottom: 12px; padding: 8px 12px; background: #ffffff; border-radius: 6px; border-left: 3px solid #34d399;">
                <span style="color: #6b7280; font-size: 11px; font-weight: 600; text-transform: uppercase; display: block; margin-bottom: 2px;">Tipo</span>
                <span style="color: #1f2937; font-size: 13px; font-weight: 600;">${eventTitle}</span>
              </div>
              
              <div style="margin-bottom: 12px; padding: 8px 12px; background: #ffffff; border-radius: 6px; border-left: 3px solid #6ee7b7;">
                <span style="color: #6b7280; font-size: 11px; font-weight: 600; text-transform: uppercase; display: block; margin-bottom: 2px;">Fecha y Hora</span>
                <span style="color: #1f2937; font-size: 13px; font-weight: 600;">${eventDate}</span>
              </div>
              
              ${event.description ? `
              <div style="margin-bottom: 12px; padding: 8px 12px; background: #ffffff; border-radius: 6px; border-left: 3px solid #a7f3d0;">
                <span style="color: #6b7280; font-size: 11px; font-weight: 600; text-transform: uppercase; display: block; margin-bottom: 2px;">Descripción</span>
                <span style="color: #1f2937; font-size: 13px;">${event.description}</span>
              </div>
              ` : ''}
            </div>
          </div>

          ${eventType !== 'deleted' ? `
          <!-- Call to Action -->
          <div style="text-align: center; margin: 24px 0;">
            <p style="color: #6b7280; font-size: 12px; margin-bottom: 16px;">
              Accede al sistema para gestionar tus eventos
            </p>
            <a href="https://ahwhtxygyzoadsmdrwwg.supabase.co/calendar" 
               style="display: inline-block; background: #10b981; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">
              📅 Ver Calendario
            </a>
          </div>
          ` : ''}
        </div>

        <!-- Clean SkyRanch Footer -->
        <div style="background: #f8fafc; padding: 32px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
          <!-- Contact Information -->
          <div style="margin-bottom: 20px;">
            <h3 style="color: #10b981; margin: 0 0 12px 0; font-size: 14px; font-weight: 600;">
              Contacto Profesional
            </h3>
            <div style="background: rgba(16, 185, 129, 0.1); padding: 12px 18px; border-radius: 8px; display: inline-block; border: 1px solid rgba(16, 185, 129, 0.2);">
              <p style="color: #10b981; margin: 0 0 4px 0; font-size: 13px; font-weight: 600;">
                📧 soporte@skyranch.es
              </p>
              <p style="color: #6b7280; margin: 0; font-size: 11px;">
                Sistema de Gestión Ganadera
              </p>
            </div>
          </div>
          
          <!-- Disclaimer -->
          <p style="color: #6b7280; margin: 0 0 16px 0; font-size: 11px; line-height: 1.5;">
            Este es un mensaje automático del sistema <strong style="color: #10b981;">${organizationName}</strong>.<br>
            Por favor, no respondas a este correo electrónico.
          </p>
          
          <!-- Copyright -->
          <p style="color: #9ca3af; margin: 0; font-size: 10px;">
            © ${new Date().getFullYear()} <span style="color: #10b981; font-weight: 600;">${organizationName}</span> - Todos los derechos reservados
          </p>
        </div>
      </div>

      <!-- Background accent -->
      <div style="text-align: center; margin-top: 20px; padding: 16px;">
        <div style="display: inline-block; padding: 8px 16px; background: #f0fdf4; border-radius: 20px; border: 1px solid #d1fae5;">
          <p style="color: #10b981; font-size: 10px; margin: 0; font-weight: 600; letter-spacing: 0.5px;">
            🌿 GESTIÓN GANADERA PROFESIONAL 🌿
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};
