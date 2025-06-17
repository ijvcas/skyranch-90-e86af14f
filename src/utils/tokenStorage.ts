
interface TokenData {
  accessToken: string;
  expiresAt: number;
  refreshToken?: string;
}

const TOKEN_STORAGE_KEY = 'gmail_oauth_token';
const TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes buffer before expiry

export const tokenStorage = {
  save: (tokenData: { accessToken: string; refreshToken?: string; expiresIn?: number }) => {
    const expiresAt = Date.now() + ((tokenData.expiresIn || 3600) * 1000);
    const data: TokenData = {
      accessToken: tokenData.accessToken,
      expiresAt,
      refreshToken: tokenData.refreshToken
    };
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(data));
    console.log('🔐 [TOKEN STORAGE] Token saved with expiry:', new Date(expiresAt).toISOString());
  },

  get: (): string | null => {
    try {
      const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!stored) return null;

      const data: TokenData = JSON.parse(stored);
      const now = Date.now();
      
      if (now >= (data.expiresAt - TOKEN_EXPIRY_BUFFER)) {
        console.log('🔐 [TOKEN STORAGE] Token expired, removing from storage');
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        return null;
      }

      console.log('🔐 [TOKEN STORAGE] Valid token found, expires at:', new Date(data.expiresAt).toISOString());
      return data.accessToken;
    } catch (error) {
      console.error('🔐 [TOKEN STORAGE] Error retrieving token:', error);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      return null;
    }
  },

  clear: () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    console.log('🔐 [TOKEN STORAGE] Token cleared from storage');
  },

  isValid: (): boolean => {
    return tokenStorage.get() !== null;
  }
};
