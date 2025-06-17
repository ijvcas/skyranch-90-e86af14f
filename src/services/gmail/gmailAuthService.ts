
import { supabase } from '@/integrations/supabase/client';
import { tokenStorage } from '@/utils/tokenStorage';
import { useToast } from '@/hooks/use-toast';

export class GmailAuthService {
  private toast: ReturnType<typeof useToast>['toast'];

  constructor(toast: ReturnType<typeof useToast>['toast']) {
    this.toast = toast;
  }

  async getAccessToken(): Promise<string | null> {
    try {
      // First check if we have a valid stored token
      const existingToken = tokenStorage.get();
      if (existingToken) {
        console.log('🔐 [GMAIL AUTH] Using existing valid token from storage');
        return existingToken;
      }

      console.log('🔐 [GMAIL AUTH] No valid token found, starting OAuth process...');
      
      // Get the OAuth authorization URL
      const { data: authUrlData, error: authUrlError } = await supabase.functions.invoke('send-gmail/auth-url', {
        body: {
          redirectUri: `${window.location.origin}/gmail-callback`
        }
      });

      if (authUrlError || !authUrlData?.authUrl) {
        console.error('❌ [GMAIL AUTH] Failed to get auth URL:', authUrlError);
        return null;
      }

      console.log('🔐 [GMAIL AUTH] Opening OAuth popup...');
      
      // Open OAuth popup
      const popup = window.open(authUrlData.authUrl, 'gmail-auth', 'width=500,height=600');
      
      if (!popup) {
        console.error('❌ [GMAIL AUTH] Popup blocked by browser');
        this.toast({
          title: "Error de Popup",
          description: "Por favor permite popups para este sitio y vuelve a intentar",
          variant: "destructive"
        });
        return null;
      }

      // Wait for OAuth callback
      return this.waitForOAuthCallback(popup);
      
    } catch (error) {
      console.error('❌ [GMAIL AUTH] Unexpected error during OAuth:', error);
      return null;
    }
  }

  private async waitForOAuthCallback(popup: Window): Promise<string | null> {
    return new Promise((resolve) => {
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          resolve(null);
        }
      }, 1000);

      const messageHandler = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'GMAIL_OAUTH_SUCCESS') {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageHandler);
          popup.close();
          
          console.log('✅ [GMAIL AUTH] OAuth authorization received, exchanging for token...');
          
          const token = await this.exchangeCodeForToken(event.data.code);
          resolve(token);
        } else if (event.data.type === 'GMAIL_OAUTH_ERROR') {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageHandler);
          popup.close();
          
          console.error('❌ [GMAIL AUTH] OAuth error:', event.data.error);
          this.toast({
            title: "Error de Autenticación Gmail",
            description: event.data.error,
            variant: "destructive"
          });
          resolve(null);
        }
      };

      window.addEventListener('message', messageHandler);
    });
  }

  private async exchangeCodeForToken(code: string): Promise<string | null> {
    try {
      const { data: tokenData, error: tokenError } = await supabase.functions.invoke('send-gmail/exchange-token', {
        body: {
          code: code,
          redirectUri: `${window.location.origin}/gmail-callback`
        }
      });

      if (tokenError || !tokenData?.accessToken) {
        console.error('❌ [GMAIL AUTH] Token exchange failed:', tokenError);
        return null;
      }

      console.log('✅ [GMAIL AUTH] Access token obtained successfully');
      
      // Store the token for future use
      tokenStorage.save({
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        expiresIn: 3600 // 1 hour default
      });
      
      return tokenData.accessToken;
    } catch (error) {
      console.error('❌ [GMAIL AUTH] Token exchange error:', error);
      return null;
    }
  }
}
