
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { mapStorage } from '../utils/mapStorage';

export const useApiKeyManagement = () => {
  const [apiKey, setApiKey] = useState<string>(() => mapStorage.getApiKey());
  const [showApiKeyInput, setShowApiKeyInput] = useState(!apiKey);
  const { toast } = useToast();

  const saveApiKey = (key: string) => {
    console.log('💾 Saving API key...');
    const success = mapStorage.saveApiKey(key);
    if (success) {
      setApiKey(key);
      setShowApiKeyInput(false);
      console.log('✅ API key saved successfully');
    } else {
      console.error('❌ Failed to save API key');
      toast({
        title: "Error",
        description: "No se pudo guardar la API key",
        variant: "destructive"
      });
    }
  };

  return {
    apiKey,
    showApiKeyInput,
    setShowApiKeyInput,
    saveApiKey
  };
};
