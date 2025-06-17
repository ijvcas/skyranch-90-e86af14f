
export class EventHeroSection {
  static render(
    eventType: string, 
    actionText: string, 
    actionColor: string, 
    actionIcon: string, 
    gradientColor: string,
    eventTitle: string
  ): string {
    return `
      <!-- Enhanced Hero Section with Gradient Background -->
      <div style="background: linear-gradient(135deg, ${gradientColor} 0%, ${actionColor} 100%); padding: 0; margin: -32px -28px 32px -28px; position: relative; overflow: hidden;">
        <!-- Decorative elements -->
        <div style="position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%; opacity: 0.6;"></div>
        <div style="position: absolute; bottom: -30px; left: -30px; width: 120px; height: 120px; background: rgba(255,255,255,0.08); border-radius: 50%; opacity: 0.4;"></div>
        
        <div style="position: relative; z-index: 1; text-align: center; padding: 40px 28px;">
          <div style="display: inline-block; background: rgba(255,255,255,0.95); padding: 16px 24px; border-radius: 50px; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
            <span style="font-size: 24px; margin-right: 8px;">${actionIcon}</span>
            <span style="color: ${actionColor}; font-weight: 700; font-size: 16px; font-family: 'Playfair Display', Georgia, serif; text-transform: uppercase; letter-spacing: 1px;">NOTIFICACIÓN DE EVENTO</span>
          </div>
          <h2 style="color: #ffffff; margin: 0 0 8px 0; font-size: 24px; font-weight: 700; font-family: 'Playfair Display', Georgia, serif; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
            ${actionText.toUpperCase()}
          </h2>
          <div style="width: 60px; height: 2px; background: rgba(255,255,255,0.8); margin: 0 auto;"></div>
        </div>
      </div>

      <!-- Event Title with Enhanced Styling -->
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; background: linear-gradient(135deg, #f8fdf8 0%, #f0f9f0 100%); border: 3px solid ${actionColor}; padding: 24px 32px; border-radius: 20px; position: relative; box-shadow: 0 8px 25px rgba(0,0,0,0.1);">
          <!-- Corner decorations -->
          <div style="position: absolute; top: -3px; left: -3px; width: 12px; height: 12px; background: ${actionColor}; border-radius: 50%;"></div>
          <div style="position: absolute; top: -3px; right: -3px; width: 12px; height: 12px; background: ${actionColor}; border-radius: 50%;"></div>
          <div style="position: absolute; bottom: -3px; left: -3px; width: 12px; height: 12px; background: ${actionColor}; border-radius: 50%;"></div>
          <div style="position: absolute; bottom: -3px; right: -3px; width: 12px; height: 12px; background: ${actionColor}; border-radius: 50%;"></div>
          
          <h3 style="margin: 0; font-size: 28px; font-weight: 700; color: #047857; font-family: 'Playfair Display', Georgia, serif; line-height: 1.2; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">
            ${eventTitle}
          </h3>
          <p style="margin: 12px 0 0 0; color: ${actionColor}; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
            ${actionText}
          </p>
        </div>
      </div>
    `;
  }
}
