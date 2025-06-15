
import { EmailContent, EmailTemplate } from '../interfaces/EmailTypes';

export interface BaseTemplateData {
  userName?: string;
  organizationName?: string;
  logoUrl?: string;
  title: string;
  content: string;
}

export class BaseEmailTemplate implements EmailTemplate {
  protected readonly defaultLogoUrl = "https://your-domain.com/lovable-uploads/953e2699-9daf-4fea-86c8-e505a1e54eb3.png";
  protected readonly defaultOrganizationName = "SkyRanch";

  render(data: BaseTemplateData): EmailContent {
    const logoUrl = data.logoUrl || this.defaultLogoUrl;
    const organizationName = data.organizationName || this.defaultOrganizationName;
    const currentYear = new Date().getFullYear();

    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.title}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; line-height: 1.5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          
          <!-- Logo Section -->
          <div style="text-align: center; padding: 32px 24px 24px 24px; background-color: #ffffff;">
            <img src="${logoUrl}" alt="${organizationName} Logo" style="width: 120px; height: 120px; margin-bottom: 16px; border-radius: 12px;">
            <h1 style="margin: 0; font-size: 32px; font-weight: 300; letter-spacing: 1px; color: #047857; font-family: 'Georgia', serif;">
              ${organizationName.toUpperCase()}
            </h1>
            <div style="width: 40px; height: 1px; background-color: #059669; margin: 12px auto;"></div>
            <p style="margin: 8px 0 0 0; font-size: 12px; color: #6b7280; letter-spacing: 0.5px; text-transform: uppercase;">
              Sistema de Gestión Ganadera
            </p>
          </div>

          <!-- Content Section -->
          <div style="padding: 24px;">
            ${data.content}
          </div>

          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 20px 24px; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="color: #6b7280; margin: 0 0 12px 0; font-size: 12px; line-height: 1.4;">
              Este es un mensaje automático del sistema <strong>${organizationName}</strong>.<br>
              Por favor, no respondas a este correo electrónico.
            </p>
            <p style="color: #9ca3af; margin: 0; font-size: 11px;">
              © ${currentYear} ${organizationName} - Sistema de Gestión Ganadera
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Generate simple text version
    const text = this.htmlToText(data.content);

    return {
      subject: data.title,
      html,
      text: `${data.title}\n\n${text}\n\n© ${currentYear} ${organizationName} - Sistema de Gestión Ganadera`
    };
  }

  protected htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
      .replace(/&amp;/g, '&') // Replace &amp; with &
      .replace(/&lt;/g, '<') // Replace &lt; with <
      .replace(/&gt;/g, '>') // Replace &gt; with >
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
  }
}
