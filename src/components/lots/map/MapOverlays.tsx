
import React from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MapOverlaysProps {
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

export const LoadingOverlay = ({ isLoading }: { isLoading: boolean }) => {
  if (!isLoading) return null;

  return (
    <div className="absolute inset-0 z-40 bg-background/50 backdrop-blur-sm flex items-center justify-center">
      <div className="text-center bg-background p-6 rounded-lg shadow-lg border">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
        <p className="text-sm text-gray-600">Cargando mapa satelital...</p>
      </div>
    </div>
  );
};

export const ErrorOverlay = ({ error, onRetry }: { error: string | null; onRetry: () => void }) => {
  if (!error) return null;

  return (
    <div className="absolute inset-0 z-40 bg-background/50 backdrop-blur-sm flex items-center justify-center">
      <div className="text-center bg-background p-6 rounded-lg shadow-lg border">
        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-600" />
        <p className="text-sm text-red-800 mb-3">{error}</p>
        <Button onClick={onRetry} variant="outline" size="sm">
          Reintentar
        </Button>
      </div>
    </div>
  );
};

export const CoordinatesInfo = () => (
  <div className="absolute bottom-4 right-4 z-30 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-lg border shadow-lg">
    <p className="text-xs text-muted-foreground">
      SkyRanch - 40°19'3.52"N, 4°28'27.47"W
    </p>
  </div>
);
