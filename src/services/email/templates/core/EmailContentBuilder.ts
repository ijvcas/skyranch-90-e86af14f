import { BaseTemplateData } from '../BaseEmailTemplate';

export class EmailContentBuilder {
  static buildHeader(logoUrl: string, organizationName: string): string {
    return `
      <!-- Elegant SkyRanch Header with App Branding -->
      <div style="background: linear-gradient(135deg, #10b981 0%, #34d399 25%, #6ee7b7 75%, #a7f3d0 100%); padding: 0; position: relative; overflow: hidden;">
        <!-- Subtle ranch pattern overlay with opacity -->
        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"80\" height=\"80\" viewBox=\"0 0 80 80\"><circle cx=\"40\" cy=\"40\" r=\"2\" fill=\"%23ffffff\" opacity=\"0.08\"/><circle cx=\"15\" cy=\"15\" r=\"1.5\" fill=\"%23ffffff\" opacity=\"0.12\"/><circle cx=\"65\" cy=\"65\" r=\"1.5\" fill=\"%23ffffff\" opacity=\"0.12\"/><circle cx=\"15\" cy=\"65\" r=\"1\" fill=\"%23ffffff\" opacity=\"0.1\"/><circle cx=\"65\" cy=\"15\" r=\"1\" fill=\"%23ffffff\" opacity=\"0.1\"/></svg>'); opacity: 0.4;"></div>
        
        <!-- Elegant geometric accent -->
        <div style="position: absolute; top: 0; right: 0; width: 200px; height: 200px; background: radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%); border-radius: 50%; transform: translate(50%, -50%);"></div>
        <div style="position: absolute; bottom: 0; left: 0; width: 150px; height: 150px; background: radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%); border-radius: 50%; transform: translate(-50%, 50%);"></div>
        
        <!-- Logo and Brand Section -->
        <div style="text-align: center; padding: 32px 24px 28px 24px; position: relative; z-index: 1;">
          <!-- Logo with enhanced styling -->
          <div style="display: inline-block; margin-bottom: 16px; padding: 6px; background: rgba(255,255,255,0.15); border-radius: 16px; backdrop-filter: blur(10px); border: 2px solid rgba(255,255,255,0.2);">
            <img src="${logoUrl}" alt="${organizationName} Logo" style="width: 60px; height: 60px; border-radius: 10px; display: block;">
          </div>
          
          <!-- Main Brand Title -->
          <h1 style="margin: 0 0 6px 0; font-size: 28px; font-weight: 700; letter-spacing: 2px; color: #ffffff; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; text-shadow: 0 2px 6px rgba(0,0,0,0.25); line-height: 1;">
            ${organizationName.toUpperCase()}
          </h1>
          
          <!-- Elegant divider -->
          <div style="display: flex; align-items: center; justify-content: center; margin: 12px 0;">
            <div style="width: 30px; height: 1px; background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%);"></div>
            <div style="width: 6px; height: 6px; background: rgba(255,255,255,0.8); border-radius: 50%; margin: 0 8px; box-shadow: 0 0 8px rgba(255,255,255,0.4);"></div>
            <div style="width: 30px; height: 1px; background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%);"></div>
          </div>
          
          <!-- Subtitle with enhanced typography -->
          <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.95); letter-spacing: 1px; text-transform: uppercase; font-weight: 500; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; text-shadow: 0 1px 3px rgba(0,0,0,0.2);">
            Sistema de Gestión Ganadera
          </p>
          
          <!-- Professional accent line -->
          <div style="margin: 12px auto 0; width: 80px; height: 2px; background: linear-gradient(90deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0.2) 100%); border-radius: 1px;"></div>
        </div>
        
        <!-- Bottom gradient fade -->
        <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 15px; background: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.08) 100%);"></div>
      </div>
    `;
  }

  static buildFooter(organizationName: string, currentYear: number): string {
    return `
      <!-- Professional SkyRanch Footer -->
      <div style="background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #d1fae5 100%); padding: 32px 24px; border-top: 2px solid #10b981; text-align: center; position: relative;">
        <!-- Subtle background pattern -->
        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"60\" height=\"60\" viewBox=\"0 0 60 60\"><circle cx=\"30\" cy=\"30\" r=\"1\" fill=\"%2310b981\" opacity=\"0.03\"/><circle cx=\"10\" cy=\"10\" r=\"0.5\" fill=\"%2334d399\" opacity=\"0.05\"/><circle cx=\"50\" cy=\"50\" r=\"0.5\" fill=\"%2334d399\" opacity=\"0.05\"/></svg>'); opacity: 0.6;"></div>
        
        <!-- Content -->
        <div style="position: relative; z-index: 1;">
          <!-- Contact Information with SkyRanch branding -->
          <div style="margin-bottom: 20px;">
            <h3 style="color: #10b981; margin: 0 0 12px 0; font-size: 14px; font-weight: 600; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; letter-spacing: 0.3px;">
              Contacto Profesional
            </h3>
            <div style="display: inline-block; background: rgba(16, 185, 129, 0.08); padding: 12px 18px; border-radius: 10px; border: 1px solid rgba(16, 185, 129, 0.15);">
              <p style="color: #10b981; margin: 0 0 6px 0; font-size: 13px; font-weight: 600; font-family: 'Inter', sans-serif;">
                📧 soporte@skyranch.es
              </p>
              <p style="color: #34d399; margin: 0; font-size: 11px; font-weight: 500;">
                🌐 Sistema de Gestión Ganadera Avanzado
              </p>
            </div>
          </div>
          
          <!-- Elegant brand divider -->
          <div style="display: flex; align-items: center; justify-content: center; margin: 24px 0;">
            <div style="flex: 1; height: 1px; background: linear-gradient(90deg, transparent 0%, #10b981 20%, #34d399 50%, #6ee7b7 80%, transparent 100%); opacity: 0.3;"></div>
            <div style="margin: 0 16px; padding: 6px 12px; background: linear-gradient(135deg, #10b981 0%, #34d399 100%); border-radius: 16px; box-shadow: 0 2px 6px rgba(16, 185, 129, 0.2);">
              <span style="color: #ffffff; font-size: 14px; font-weight: bold;">🐄</span>
            </div>
            <div style="flex: 1; height: 1px; background: linear-gradient(90deg, transparent 0%, #10b981 20%, #34d399 50%, #6ee7b7 80%, transparent 100%); opacity: 0.3;"></div>
          </div>
          
          <!-- Disclaimer with SkyRanch styling -->
          <p style="color: #10b981; margin: 0 0 16px 0; font-size: 11px; line-height: 1.5; font-weight: 500; max-width: 400px; margin-left: auto; margin-right: auto;">
            Este es un mensaje automático del sistema <strong style="color: #10b981; font-weight: 600;">${organizationName}</strong>.<br>
            Por favor, no respondas a este correo electrónico.
          </p>
          
          <!-- Professional signature card -->
          <div style="background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); border: 1px solid #d1fae5; border-radius: 12px; padding: 18px; margin: 20px auto 0; max-width: 320px; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.06);">
            <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 8px;">
              <div style="width: 24px; height: 24px; background: linear-gradient(135deg, #10b981 0%, #34d399 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 8px;">
                <span style="color: #ffffff; font-size: 12px; font-weight: bold;">🌿</span>
              </div>
              <p style="color: #10b981; margin: 0; font-size: 13px; font-weight: 600; font-family: 'Inter', sans-serif; letter-spacing: 0.3px;">
                Gestión Ganadera Profesional
              </p>
            </div>
            <p style="color: #34d399; margin: 0; font-size: 10px; font-weight: 500; letter-spacing: 0.2px;">
              Tecnología avanzada para el manejo eficiente de ganado
            </p>
          </div>
          
          <!-- Copyright with elegant styling -->
          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid rgba(16, 185, 129, 0.15);">
            <p style="color: #6b7280; margin: 0; font-size: 10px; font-weight: 500; letter-spacing: 0.3px;">
              © ${currentYear} <span style="color: #10b981; font-weight: 600;">${organizationName}</span> - Todos los derechos reservados
            </p>
          </div>
        </div>
      </div>
    `;
  }

  static buildBackgroundPattern(): string {
    return `
      <!-- SkyRanch branded background accent -->
      <div style="text-align: center; margin-top: 24px; padding: 20px;">
        <div style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border-radius: 25px; border: 1px solid #d1fae5;">
          <p style="color: #10b981; font-size: 11px; margin: 0; font-weight: 600; letter-spacing: 1px;">
            🌿 COMPROMETIDOS CON LA EXCELENCIA EN GESTIÓN GANADERA 🌿
          </p>
        </div>
      </div>
    `;
  }

  static wrapInContainer(content: string): string {
    return `
      <div style="max-width: 650px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 8px 32px rgba(16, 185, 129, 0.12), 0 2px 8px rgba(0,0,0,0.08); border-radius: 16px; overflow: hidden; border: 1px solid rgba(16, 185, 129, 0.1);">
        ${content}
      </div>
    `;
  }

  static getEmailDoctype(): string {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
        <title>SkyRanch - Sistema de Gestión Ganadera</title>
      </head>
      <body style="margin: 0; padding: 20px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%); line-height: 1.6; color: #334155;">
    `;
  }

  static getEmailClosing(): string {
    return `
      </body>
      </html>
    `;
  }
}
