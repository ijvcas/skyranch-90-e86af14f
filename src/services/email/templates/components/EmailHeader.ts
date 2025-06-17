
export class EmailHeader {
  static render(logoUrl: string, organizationName: string): string {
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
}
