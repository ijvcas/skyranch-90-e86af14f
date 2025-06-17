
export class EmailHeader {
  static render(logoUrl: string, organizationName: string): string {
    return `
      <!-- Clean SkyRanch Header -->
      <div style="background: linear-gradient(135deg, #10b981 0%, #34d399 25%, #6ee7b7 75%, #a7f3d0 100%); padding: 40px 24px; text-align: center; position: relative; overflow: hidden;">
        <!-- Subtle background pattern -->
        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"80\" height=\"80\" viewBox=\"0 0 80 80\"%3E%3Ccircle cx=\"40\" cy=\"40\" r=\"2\" fill=\"%23ffffff\" opacity=\"0.08\"/%3E%3Ccircle cx=\"15\" cy=\"15\" r=\"1.5\" fill=\"%23ffffff\" opacity=\"0.12\"/%3E%3Ccircle cx=\"65\" cy=\"65\" r=\"1.5\" fill=\"%23ffffff\" opacity=\"0.12\"/%3E%3C/svg%3E'); opacity: 0.4;"></div>
        
        <!-- Logo -->
        <div style="position: relative; z-index: 1;">
          <div style="display: inline-block; margin-bottom: 16px; padding: 8px; background: rgba(255,255,255,0.15); border-radius: 16px; border: 2px solid rgba(255,255,255,0.2);">
            <img src="${logoUrl}" alt="${organizationName} Logo" style="width: 60px; height: 60px; border-radius: 12px; display: block;">
          </div>
          
          <!-- Brand Title -->
          <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700; color: #ffffff; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; text-shadow: 0 2px 4px rgba(0,0,0,0.2); letter-spacing: 1px;">
            ${organizationName.toUpperCase()}
          </h1>
          
          <!-- Divider -->
          <div style="width: 60px; height: 1px; background: rgba(255,255,255,0.6); margin: 12px auto;"></div>
          
          <!-- Subtitle -->
          <p style="margin: 0; font-size: 11px; color: rgba(255,255,255,0.9); letter-spacing: 0.5px; text-transform: uppercase; font-weight: 500;">
            Sistema de Gestión Ganadera
          </p>
        </div>
      </div>
    `;
  }
}
