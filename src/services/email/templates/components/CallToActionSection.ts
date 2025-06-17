
export class CallToActionSection {
  static render(eventType: string): string {
    if (eventType === 'deleted') return '';
    
    return `
      <!-- Premium Call to Action -->
      <div style="text-align: center; margin: 40px 0; padding: 32px; background: linear-gradient(135deg, #ffffff 0%, #f8fdf8 100%); border-radius: 20px; border: 2px solid #e5f3e5; position: relative; overflow: hidden; box-shadow: 0 10px 30px rgba(4, 120, 87, 0.1);">
        <!-- Background decoration -->
        <div style="position: absolute; top: -50px; left: -50px; width: 100px; height: 100px; background: linear-gradient(45deg, #059669, #10b981); border-radius: 50%; opacity: 0.1;"></div>
        <div style="position: absolute; bottom: -50px; right: -50px; width: 100px; height: 100px; background: linear-gradient(45deg, #047857, #059669); border-radius: 50%; opacity: 0.1;"></div>
        
        <div style="position: relative; z-index: 1;">
          <div style="margin-bottom: 24px;">
            <span style="font-size: 32px; display: block; margin-bottom: 12px;">🌟</span>
            <p style="color: #6b7280; font-size: 16px; margin-bottom: 8px; font-weight: 500; font-family: 'Playfair Display', Georgia, serif;">
              Accede al sistema para gestionar todos tus eventos ganaderos
            </p>
            <p style="color: #9ca3af; font-size: 14px; margin-bottom: 0; font-style: italic;">
              Gestión profesional y eficiente de tu ganado
            </p>
          </div>
          
          <a href="https://id-preview--d956216c-86a1-4ff3-9df4-bdfbbabf459a.lovable.app/calendar" 
             style="display: inline-block; background: linear-gradient(135deg, #047857 0%, #059669 50%, #10b981 100%); 
                    color: white; 
                    text-decoration: none; 
                    padding: 16px 40px; 
                    border-radius: 50px; 
                    font-weight: 700; 
                    font-size: 16px; 
                    box-shadow: 0 8px 25px rgba(5, 150, 105, 0.4);
                    transition: all 0.3s ease;
                    border: 2px solid transparent;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    font-family: 'Inter', sans-serif;">
             <span style="margin-right: 8px;">📅</span>
             Ver Calendario Completo
          </a>
          
          <p style="color: #9ca3af; font-size: 12px; margin: 20px 0 0 0; font-style: italic;">
            Tecnología avanzada para el manejo eficiente de ganado
          </p>
        </div>
      </div>
    `;
  }
}
