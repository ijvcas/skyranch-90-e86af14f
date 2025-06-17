
// Email template generation utilities with enhanced SkyRanch branding
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

  // Use the SkyRanch logo from the app uploads
  const logoUrl = "/lovable-uploads/953e2699-9daf-4fea-86c8-e505a1e54eb3.png";

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 20px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%); line-height: 1.6; color: #334155;">
      <div style="max-width: 650px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 8px 32px rgba(16, 185, 129, 0.12), 0 2px 8px rgba(0,0,0,0.08); border-radius: 16px; overflow: hidden; border: 1px solid rgba(16, 185, 129, 0.1);">
        
        <!-- Elegant SkyRanch Header -->
        <div style="background: linear-gradient(135deg, #10b981 0%, #34d399 25%, #6ee7b7 75%, #a7f3d0 100%); padding: 0; position: relative; overflow: hidden;">
          <!-- Subtle background pattern -->
          <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"80\" height=\"80\" viewBox=\"0 0 80 80\"><circle cx=\"40\" cy=\"40\" r=\"2\" fill=\"%23ffffff\" opacity=\"0.08\"/><circle cx=\"15\" cy=\"15\" r=\"1.5\" fill=\"%23ffffff\" opacity=\"0.12\"/><circle cx=\"65\" cy=\"65\" r=\"1.5\" fill=\"%23ffffff\" opacity=\"0.12\"/></svg>'); opacity: 0.4;"></div>
          
          <!-- Elegant geometric accents -->
          <div style="position: absolute; top: 0; right: 0; width: 200px; height: 200px; background: radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%); border-radius: 50%; transform: translate(50%, -50%);"></div>
          
          <!-- Logo and Brand Section -->
          <div style="text-align: center; padding: 32px 24px 28px 24px; position: relative; z-index: 1;">
            <div style="display: inline-block; margin-bottom: 16px; padding: 6px; background: rgba(255,255,255,0.15); border-radius: 16px; backdrop-filter: blur(10px); border: 2px solid rgba(255,255,255,0.2);">
              <img src="${logoUrl}" alt="SkyRanch Logo" style="width: 60px; height: 60px; border-radius: 10px; display: block;">
            </div>
            
            <h1 style="margin: 0 0 6px 0; font-size: 28px; font-weight: 700; letter-spacing: 2px; color: #ffffff; font-family: 'Inter', sans-serif; text-shadow: 0 2px 6px rgba(0,0,0,0.25); line-height: 1;">
              SKYRANCH
            </h1>
            
            <!-- Elegant divider -->
            <div style="display: flex; align-items: center; justify-content: center; margin: 12px 0;">
              <div style="width: 30px; height: 1px; background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%);"></div>
              <div style="width: 6px; height: 6px; background: rgba(255,255,255,0.8); border-radius: 50%; margin: 0 8px; box-shadow: 0 0 8px rgba(255,255,255,0.4);"></div>
              <div style="width: 30px; height: 1px; background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%);"></div>
            </div>
            
            <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.95); letter-spacing: 1px; text-transform: uppercase; font-weight: 500; text-shadow: 0 1px 3px rgba(0,0,0,0.2);">
              Sistema de Gestión Ganadera
            </p>
            
            <div style="margin: 12px auto 0; width: 80px; height: 2px; background: linear-gradient(90deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0.2) 100%); border-radius: 1px;"></div>
          </div>
        </div>

        <!-- Event Status Banner -->
        <div style="padding: 20px 24px; text-align: center; background: ${actionBgColor}; border-bottom: 1px solid rgba(16, 185, 129, 0.1);">
          <div style="display: inline-block; background: ${actionColor}; color: white; padding: 12px 24px; border-radius: 10px; box-shadow: 0 3px 8px rgba(16, 185, 129, 0.2);">
            <h2 style="margin: 0; font-size: 15px; font-weight: 600; letter-spacing: 0.3px;">
              ${subject}
            </h2>
          </div>
        </div>

        <!-- Main Content -->
        <div style="padding: 32px 24px;">
          <!-- Greeting -->
          <div style="margin-bottom: 28px;">
            <h3 style="color: #10b981; font-size: 16px; font-weight: 600; margin: 0 0 6px 0; font-family: 'Inter', sans-serif;">
              Hola ${userName} 👋
            </h3>
            <p style="color: #34d399; font-size: 14px; margin: 0; font-weight: 500; line-height: 1.5;">
              Te informamos que el evento <strong style="color: #10b981;">${event.title}</strong> ${actionText} en el sistema.
            </p>
          </div>

          <!-- Event Details Card -->
          <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 2px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px; box-shadow: 0 2px 6px rgba(0,0,0,0.04);">
            <div style="display: flex; align-items: center; margin-bottom: 16px;">
              <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #10b981 0%, #34d399 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                <span style="color: #ffffff; font-size: 16px;">📋</span>
              </div>
              <h4 style="color: #10b981; margin: 0; font-size: 16px; font-weight: 600; font-family: 'Inter', sans-serif;">
                Detalles del Evento
              </h4>
            </div>
            
            <div style="space-y: 12px;">
              <div style="margin-bottom: 12px; padding: 10px 12px; background: #ffffff; border-radius: 6px; border-left: 3px solid #10b981;">
                <span style="color: #6b7280; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; display: block; margin-bottom: 3px;">Título</span>
                <span style="color: #1f2937; font-size: 13px; font-weight: 600;">${event.title}</span>
              </div>
              
              <div style="margin-bottom: 12px; padding: 10px 12px; background: #ffffff; border-radius: 6px; border-left: 3px solid #34d399;">
                <span style="color: #6b7280; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; display: block; margin-bottom: 3px;">Tipo</span>
                <span style="color: #1f2937; font-size: 13px; font-weight: 600;">${eventTitle}</span>
              </div>
              
              <div style="margin-bottom: 12px; padding: 10px 12px; background: #ffffff; border-radius: 6px; border-left: 3px solid #6ee7b7;">
                <span style="color: #6b7280; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; display: block; margin-bottom: 3px;">Fecha y Hora</span>
                <span style="color: #1f2937; font-size: 13px; font-weight: 600;">${eventDate}</span>
              </div>
              
              ${event.description ? `
              <div style="margin-bottom: 12px; padding: 10px 12px; background: #ffffff; border-radius: 6px; border-left: 3px solid #a7f3d0;">
                <span style="color: #6b7280; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; display: block; margin-bottom: 3px;">Descripción</span>
                <span style="color: #1f2937; font-size: 13px;">${event.description}</span>
              </div>
              ` : ''}
              
              ${event.location ? `
              <div style="margin-bottom: 12px; padding: 10px 12px; background: #ffffff; border-radius: 6px; border-left: 3px solid #d1fae5;">
                <span style="color: #6b7280; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; display: block; margin-bottom: 3px;">Ubicación</span>
                <span style="color: #1f2937; font-size: 13px;">${event.location}</span>
              </div>
              ` : ''}
            </div>
          </div>

          ${eventType !== 'deleted' ? `
          <!-- Call to Action -->
          <div style="text-align: center; margin: 24px 0;">
            <p style="color: #6b7280; font-size: 12px; margin-bottom: 16px; font-weight: 500;">
              Accede al sistema para gestionar tus eventos
            </p>
            <a href="https://ahwhtxygyzoadsmdrwwg.supabase.co/calendar" 
               style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #34d399 100%); 
                      color: white; 
                      text-decoration: none; 
                      padding: 12px 24px; 
                      border-radius: 10px; 
                      font-weight: 600; 
                      font-size: 14px;
                      letter-spacing: 0.3px;
                      box-shadow: 0 3px 8px rgba(16, 185, 129, 0.25);
                      transition: all 0.2s ease;">
              📅 Ver Calendario
            </a>
          </div>
          ` : ''}
        </div>

        <!-- Professional SkyRanch Footer -->
        <div style="background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #d1fae5 100%); padding: 32px 24px; border-top: 2px solid #10b981; text-align: center;">
          <div style="margin-bottom: 20px;">
            <h3 style="color: #10b981; margin: 0 0 12px 0; font-size: 14px; font-weight: 600; letter-spacing: 0.3px;">
              Contacto Profesional
            </h3>
            <div style="display: inline-block; background: rgba(16, 185, 129, 0.08); padding: 12px 18px; border-radius: 10px; border: 1px solid rgba(16, 185, 129, 0.15);">
              <p style="color: #10b981; margin: 0 0 6px 0; font-size: 13px; font-weight: 600;">
                📧 soporte@skyranch.es
              </p>
              <p style="color: #34d399; margin: 0; font-size: 11px; font-weight: 500;">
                🌐 Sistema de Gestión Ganadera Avanzado
              </p>
            </div>
          </div>
          
          <!-- Brand divider -->
          <div style="display: flex; align-items: center; justify-content: center; margin: 24px 0;">
            <div style="flex: 1; height: 1px; background: linear-gradient(90deg, transparent 0%, #10b981 50%, transparent 100%); opacity: 0.3;"></div>
            <div style="margin: 0 16px; padding: 6px 12px; background: linear-gradient(135deg, #10b981 0%, #34d399 100%); border-radius: 16px;">
              <span style="color: #ffffff; font-size: 14px; font-weight: bold;">🐄</span>
            </div>
            <div style="flex: 1; height: 1px; background: linear-gradient(90deg, transparent 0%, #10b981 50%, transparent 100%); opacity: 0.3;"></div>
          </div>
          
          <p style="color: #10b981; margin: 0 0 16px 0; font-size: 11px; line-height: 1.5; font-weight: 500;">
            Este es un mensaje automático del sistema <strong style="font-weight: 600;">${organizationName}</strong>.<br>
            Por favor, no respondas a este correo electrónico.
          </p>
          
          <p style="color: #6b7280; margin: 0; font-size: 10px; font-weight: 500; letter-spacing: 0.3px;">
            © ${new Date().getFullYear()} <span style="color: #10b981; font-weight: 600;">${organizationName}</span> - Todos los derechos reservados
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};
