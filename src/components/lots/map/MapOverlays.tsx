
import React, { useState } from 'react';
import { Loader2, AlertCircle, Key, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { API_KEY_INSTRUCTIONS } from './mapConstants';

export const LoadingOverlay = ({ isLoading }: { isLoading: boolean }) => {
  if (!isLoading) return null;

  return (
    <div className="absolute inset-0 z-40 bg-background/60 backdrop-blur-sm flex items-center justify-center">
      <div className="text-center bg-background p-8 rounded-lg shadow-xl border">
        <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3 text-green-600" />
        <p className="text-base font-medium text-foreground mb-1">Cargando SkyRanch</p>
        <p className="text-sm text-muted-foreground">Preparando vista satelital con mediciones de área...</p>
      </div>
    </div>
  );
};

export const ErrorOverlay = ({ error, onRetry }: { error: string | null; onRetry: () => void }) => {
  if (!error) return null;

  return (
    <div className="absolute inset-0 z-40 bg-background/60 backdrop-blur-sm flex items-center justify-center">
      <div className="text-center bg-background p-8 rounded-lg shadow-xl border max-w-md">
        <AlertCircle className="w-10 h-10 mx-auto mb-3 text-red-600" />
        <p className="text-base font-medium text-foreground mb-2">Error al cargar el mapa</p>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button onClick={onRetry} variant="outline" size="sm">
          Intentar de nuevo
        </Button>
      </div>
    </div>
  );
};

export const ApiKeyInput = ({ 
  show, 
  apiKey, 
  onApiKeyChange, 
  onSubmit 
}: { 
  show: boolean;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  onSubmit: () => void;
}) => {
  const [inputValue, setInputValue] = useState(apiKey);

  if (!show) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApiKeyChange(inputValue);
    onSubmit();
  };

  return (
    <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Key className="w-5 h-5 mr-2" />
            Configurar Google Maps API
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground whitespace-pre-line">
              {API_KEY_INSTRUCTIONS}
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                type="text"
                placeholder="Ingresa tu Google Maps API Key"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="font-mono text-sm"
              />
              <Button type="submit" className="w-full" disabled={!inputValue.trim()}>
                <Save className="w-4 h-4 mr-2" />
                Guardar y Cargar Mapa
              </Button>
            </form>
            <div className="text-xs text-muted-foreground text-center">
              La API key se guardará localmente para todos los usuarios
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const CoordinatesInfo = () => (
  <div className="absolute bottom-4 right-4 z-30 bg-background/95 backdrop-blur-sm px-4 py-2 rounded-lg border shadow-lg">
    <p className="text-xs text-muted-foreground font-mono">
      SkyRanch - 40°19'3.52"N, 4°28'27.47"W | Google Maps con mediciones
    </p>
  </div>
);
