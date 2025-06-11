
import { useState } from 'react';

const API_KEY_STORAGE_KEY = 'skyranch_google_maps_api_key';
const FORCE_API_KEY = 'AIzaSyBo7e7hBrnCCtJDSaftXEFHP4qi-KiKXzI';

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
  console.log('🔑 useApiKeyStorage: Force using hardcoded API key');
  
  // Always use the force API key - no localStorage needed
  const [apiKey] = useState<string>(FORCE_API_KEY);
  
  // Never show API key input since we have a hardcoded key
  const [showApiKeyInput] = useState<boolean>(false);

  const setApiKey = (key: string) => {
    console.log('💾 API key setting attempted, but using force key instead');
    return true; // Always return success since we're using force key
  };

  console.log('🔑 useApiKeyStorage final state - API Key:', !!apiKey, 'Show input:', showApiKeyInput);

  return {
    apiKey,
    showApiKeyInput,
    setApiKey
  };
};
