
import { BaseTemplateData } from '../BaseEmailTemplate';

export class EmailContentBuilder {
  static buildHeader(logoUrl: string, organizationName: string): string {
    return `
      <!-- Header with Ranch Pattern -->
      <div style="background: linear-gradient(135deg, #047857 0%, #059669 50%, #10b981 100%); padding: 0; position: relative;">
        <!-- Subtle ranch pattern overlay -->
        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"60\" height=\"60\" viewBox=\"0 0 60 60\"><circle cx=\"30\" cy=\"30\" r=\"2\" fill=\"%23ffffff\" opacity=\"0.1\"/><circle cx=\"10\" cy=\"10\" r=\"1\" fill=\"%23ffffff\" opacity=\"0.15\"/><circle cx=\"50\" cy=\"50\" r=\"1\" fill=\"%23ffffff\" opacity=\"0.15\"/></svg>'); opacity: 0.6;"></div>
        
        <!-- Logo Section -->
        <div style="text-align: center; padding: 40px 24px 32px 24px; position: relative; z-index: 1;">
          <img src="${logoUrl}" alt="${organizationName} Logo" style="width: 100px; height: 100px; margin-bottom: 20px; border-radius: 16px; border: 3px solid rgba(255,255,255,0.2); box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
          <h1 style="margin: 0; font-size: 36px; font-weight: 700; letter-spacing: 2px; color: #ffffff; font-family: 'Playfair Display', Georgia, serif; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
            ${organizationName.toUpperCase()}
          </h1>
          <div style="width: 60px; height: 2px; background: linear-gradient(90deg, transparent 0%, #ffffff 50%, transparent 100%); margin: 16px auto;"></div>
          <p style="margin: 12px 0 0 0; font-size: 14px; color: rgba(255,255,255,0.9); letter-spacing: 1px; text-transform: uppercase; font-weight: 500;">
            Sistema de Gestión Ganadera
          </p>
        </div>
      </div>
    `;
  }

  static buildFooter(organizationName: string, currentYear: number): string {
    return `
      <!-- Professional Footer -->
      <div style="background: linear-gradient(135deg, #f8fdf8 0%, #f0f9f0 100%); padding: 28px; border-top: 1px solid #e5f3e5; text-align: center;">
        <!-- Contact Information -->
        <div style="margin-bottom: 20px;">
          <h3 style="color: #047857; margin: 0 0 12px 0; font-size: 16px; font-weight: 600; font-family: 'Playfair Display', Georgia, serif;">
            Contacto Profesional
          </h3>
          <p style="color: #059669; margin: 0 0 8px 0; font-size: 14px; font-weight: 500;">
            📧 soporte@skyranch.es
          </p>
          <p style="color: #6b7280; margin: 0; font-size: 13px;">
            🏢 SkyRanch - Sistema de Gestión Ganadera Profesional
          </p>
        </div>
        
        <!-- Ranch Divider -->
        <div style="display: flex; align-items: center; justify-content: center; margin: 20px 0;">
          <div style="flex: 1; height: 1px; background: linear-gradient(90deg, transparent 0%, #d1d5db 50%, transparent 100%);"></div>
          <div style="margin: 0 16px; color: #059669; font-size: 18px;">🐄</div>
          <div style="flex: 1; height: 1px; background: linear-gradient(90deg, transparent 0%, #d1d5db 50%, transparent 100%);"></div>
        </div>
        
        <p style="color: #6b7280; margin: 0 0 16px 0; font-size: 12px; line-height: 1.5;">
          Este es un mensaje automático del sistema <strong style="color: #047857;">${organizationName}</strong>.<br>
          Por favor, no respondas a este correo electrónico.
        </p>
        
        <!-- Professional Signature -->
        <div style="background-color: #ffffff; border: 1px solid #e5f3e5; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="color: #047857; margin: 0; font-size: 13px; font-weight: 600; font-family: 'Playfair Display', Georgia, serif;">
            Gestión Ganadera Profesional
          </p>
          <p style="color: #6b7280; margin: 4px 0 0 0; font-size: 11px;">
            Tecnología avanzada para el manejo eficiente de ganado
          </p>
        </div>
        
        <p style="color: #9ca3af; margin: 0; font-size: 11px; font-style: italic;">
          © ${currentYear} ${organizationName} - Todos los derechos reservados
        </p>
      </div>
    `;
  }

  static buildBackgroundPattern(): string {
    return `
      <!-- Subtle background pattern for the entire email -->
      <div style="text-align: center; margin-top: 20px; padding: 16px;">
        <p style="color: #9ca3af; font-size: 10px; margin: 0;">
          🌿 Comprometidos con la excelencia en gestión ganadera 🌿
        </p>
      </div>
    `;
  }

  static wrapInContainer(content: string): string {
    return `
      <div style="max-width: 650px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border-radius: 12px; overflow: hidden;">
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
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #f8fdf8 0%, #f0f9f0 100%); line-height: 1.6;">
    `;
  }

  static getEmailClosing(): string {
    return `
      </body>
      </html>
    `;
  }
}
