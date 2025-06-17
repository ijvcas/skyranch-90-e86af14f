
import { supabase } from '@/integrations/supabase/client';

export class GmailOAuthHandler {
  private readonly redirectUri: string;

  constructor() {
    this.redirectUri = `${window.location.origin}/gmail-callback`;
  }

  async getAuthorizationUrl(): Promise<string> {
    console.log('🔐 [GMAIL OAUTH] Getting authorization URL...');
    
    const { data, error } = await supabase.functions.invoke('send-gmail', {
      body: { redirectUri: this.redirectUri }
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (error || !data?.authUrl) {
      console.error('🔐 [GMAIL OAUTH] Failed to get auth URL:', error);
      throw new Error('Failed to get Gmail authorization URL');
    }

    console.log('🔐 [GMAIL OAUTH] Authorization URL obtained successfully');
    return data.authUrl;
  }

  async exchangeCodeForToken(code: string): Promise<{ accessToken: string; refreshToken?: string }> {
    console.log('🔐 [GMAIL OAUTH] Exchanging code for token...');
    
    const { data, error } = await supabase.functions.invoke('send-gmail', {
      body: { 
        code, 
        redirectUri: this.redirectUri 
      }
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (error || !data?.accessToken) {
      console.error('🔐 [GMAIL OAUTH] Token exchange failed:', error);
      throw new Error(data?.message || 'Failed to exchange code for token');
    }

    console.log('🔐 [GMAIL OAUTH] Token exchange successful');
    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken
    };
  }

  openAuthorizationWindow(authUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const popup = window.open(authUrl, 'gmail-oauth', 'width=500,height=600');
      
      if (!popup) {
        reject(new Error('Failed to open OAuth popup'));
        return;
      }

      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          reject(new Error('OAuth popup was closed'));
        }
      }, 1000);

      const messageHandler = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'GMAIL_OAUTH_SUCCESS') {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageHandler);
          popup.close();
          resolve(event.data.authorizationCode);
        } else if (event.data.type === 'GMAIL_OAUTH_ERROR') {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageHandler);
          popup.close();
          reject(new Error(event.data.error));
        }
      };

      window.addEventListener('message', messageHandler);
    });
  }
}
