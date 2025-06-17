
import { GmailTokenManager } from './core/GmailTokenManager';
import { GmailOAuthHandler } from './core/GmailOAuthHandler';

export class GmailAuthService {
  private tokenManager: GmailTokenManager;
  private oauthHandler: GmailOAuthHandler;
  private toast: any;

  constructor(toast: any) {
    this.toast = toast;
    this.tokenManager = new GmailTokenManager();
    this.oauthHandler = new GmailOAuthHandler();
  }

  async getAccessToken(): Promise<string | null> {
    console.log('🔐 [GMAIL AUTH SERVICE] Getting access token...');
    
    const storedToken = await this.tokenManager.getStoredToken();
    if (storedToken) {
      return storedToken;
    }

    console.log('🔐 [GMAIL AUTH SERVICE] No valid token found, starting OAuth flow...');
    return await this.authenticate();
  }

  private async authenticate(): Promise<string | null> {
    try {
      console.log('🔐 [GMAIL AUTH SERVICE] Starting OAuth authentication...');
      
      const authUrl = await this.oauthHandler.getAuthorizationUrl();
      const authorizationCode = await this.oauthHandler.openAuthorizationWindow(authUrl);
      const tokenData = await this.oauthHandler.exchangeCodeForToken(authorizationCode);
      
      this.tokenManager.saveToken({
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        expiresIn: 3600
      });

      this.toast({
        title: "✅ Autenticación Gmail exitosa",
        description: "Ahora puedes enviar notificaciones por correo electrónico"
      });

      console.log('🔐 [GMAIL AUTH SERVICE] Authentication completed successfully');
      return tokenData.accessToken;
      
    } catch (error) {
      console.error('🔐 [GMAIL AUTH SERVICE] Authentication failed:', error);
      
      this.toast({
        title: "❌ Error de autenticación Gmail",
        description: error.message || "No se pudo completar la autenticación",
        variant: "destructive"
      });
      
      return null;
    }
  }

  isAuthenticated(): boolean {
    return this.tokenManager.isTokenValid();
  }

  clearAuthentication() {
    this.tokenManager.clearToken();
    console.log('🔐 [GMAIL AUTH SERVICE] Authentication cleared');
  }
}
