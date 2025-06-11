
import { useState } from 'react';

const API_KEY_STORAGE_KEY = 'skyranch_google_maps_api_key';

const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('localStorage not available:', error);
      return null;
    }
  },
  setItem: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn('localStorage save failed:', error);
      return false;
    }
  }
};

export const useApiKeyStorage = () => {
  const [apiKey, setApiKeyState] = useState<string>(() => 
    safeLocalStorage.getItem(API_KEY_STORAGE_KEY) || ''
  );
  const [showApiKeyInput, setShowApiKeyInput] = useState<boolean>(() => 
    !safeLocalStorage.getItem(API_KEY_STORAGE_KEY)
  );

  const setApiKey = (key: string) => {
    console.log('💾 Saving API key');
    const trimmedKey = key.trim();
    if (!trimmedKey) {
      console.error('❌ Empty API key provided');
      return false;
    }
    
    const success = safeLocalStorage.setItem(API_KEY_STORAGE_KEY, trimmedKey);
    if (success) {
      setApiKeyState(trimmedKey);
      setShowApiKeyInput(false);
      console.log('✅ API key saved and state updated');
      return true;
    }
    
    console.error('❌ Failed to save API key to localStorage');
    return false;
  };

  return {
    apiKey,
    showApiKeyInput,
    setApiKey
  };
};
