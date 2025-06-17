
import { tokenStorage } from '@/utils/tokenStorage';

export class GmailTokenManager {
  async getStoredToken(): Promise<string | null> {
    const token = tokenStorage.get();
    if (token) {
      console.log('🔐 [GMAIL TOKEN MANAGER] Valid stored token found');
      return token;
    }
    console.log('🔐 [GMAIL TOKEN MANAGER] No valid stored token found');
    return null;
  }

  saveToken(tokenData: { accessToken: string; refreshToken?: string; expiresIn?: number }) {
    tokenStorage.save(tokenData);
    console.log('🔐 [GMAIL TOKEN MANAGER] Token saved successfully');
  }

  clearToken() {
    tokenStorage.clear();
    console.log('🔐 [GMAIL TOKEN MANAGER] Token cleared');
  }

  isTokenValid(): boolean {
    return tokenStorage.isValid();
  }
}
