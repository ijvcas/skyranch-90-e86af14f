
import { useState } from 'react';

const API_KEY_STORAGE_KEY = 'skyranch_google_maps_api_key';
const FORCE_API_KEY = 'AIzaSyBo7e7hBrnCCtJDSaftXEFHP4qi-KiKXzI'; // Direct override

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
  console.log('🔑 useApiKeyStorage: Initializing with force override');
  
  // Force set the API key immediately
  const [apiKey, setApiKeyState] = useState<string>(() => {
    console.log('🔑 Getting initial API key...');
    
    // First try to use the force key
    if (FORCE_API_KEY) {
      console.log('🔑 Using force API key');
      // Also save it to localStorage for persistence
      safeLocalStorage.setItem(API_KEY_STORAGE_KEY, FORCE_API_KEY);
      return FORCE_API_KEY;
    }
    
    // Fallback to stored key
    const stored = safeLocalStorage.getItem(API_KEY_STORAGE_KEY);
    console.log('🔑 Stored API key exists:', !!stored);
    return stored || '';
  });

  // Never show API key input since we have a force key
  const [showApiKeyInput, setShowApiKeyInput] = useState<boolean>(() => {
    const hasKey = !!apiKey || !!FORCE_API_KEY;
    console.log('🔑 Show API key input:', !hasKey);
    return !hasKey;
  });

  const setApiKey = (key: string) => {
    console.log('💾 Setting API key:', key ? 'provided' : 'empty');
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

  console.log('🔑 useApiKeyStorage state - API Key exists:', !!apiKey, 'Show input:', showApiKeyInput);

  return {
    apiKey,
    showApiKeyInput,
    setApiKey
  };
};
