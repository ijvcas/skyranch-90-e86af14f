
export class EmailStyleManager {
  static getHeaderStyles() {
    return {
      background: 'linear-gradient(135deg, #047857 0%, #059669 50%, #10b981 100%)',
      padding: '0',
      position: 'relative' as const
    };
  }

  static getLogoStyles() {
    return {
      width: '100px',
      height: '100px',
      marginBottom: '20px',
      borderRadius: '16px',
      border: '3px solid rgba(255,255,255,0.2)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    };
  }

  static getTitleStyles() {
    return {
      margin: '0',
      fontSize: '36px',
      fontWeight: '700' as const,
      letterSpacing: '2px',
      color: '#ffffff',
      fontFamily: "'Playfair Display', Georgia, serif",
      textShadow: '0 2px 4px rgba(0,0,0,0.2)'
    };
  }

  static getContentStyles() {
    return {
      padding: '32px 28px'
    };
  }

  static getFooterStyles() {
    return {
      background: 'linear-gradient(135deg, #f8fdf8 0%, #f0f9f0 100%)',
      padding: '28px',
      borderTop: '1px solid #e5f3e5',
      textAlign: 'center' as const
    };
  }
}
