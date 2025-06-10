
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { API_KEY_INSTRUCTIONS } from './mapConstants';

interface ApiKeySetupProps {
  onApiKeySubmit: (key: string) => void;
}

export const ApiKeySetup = ({ onApiKeySubmit }: ApiKeySetupProps) => {
  const [tempApiKey, setTempApiKey] = useState('');

  const handleSubmit = () => {
    if (tempApiKey.trim()) {
      onApiKeySubmit(tempApiKey.trim());
      setTempApiKey('');
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Configurar Google Maps
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600 whitespace-pre-line">
            {API_KEY_INSTRUCTIONS}
          </div>
          <div className="flex gap-2">
            <Input
              type="password"
              placeholder="Ingresa tu Google Maps API Key"
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            />
            <Button onClick={handleSubmit} disabled={!tempApiKey.trim()}>
              Guardar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
