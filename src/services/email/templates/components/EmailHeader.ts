
export class EmailHeader {
  static render(logoUrl: string, organizationName: string): string {
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
}
