
import React from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const LoadingOverlay = ({ isLoading }: { isLoading: boolean }) => {
  if (!isLoading) return null;

  return (
    <div className="absolute inset-0 z-40 bg-background/60 backdrop-blur-sm flex items-center justify-center">
      <div className="text-center bg-background p-8 rounded-lg shadow-xl border">
        <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3 text-green-600" />
        <p className="text-base font-medium text-foreground mb-1">Cargando SkyRanch</p>
        <p className="text-sm text-muted-foreground">Preparando vista satelital con lotes reales...</p>
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

export const CoordinatesInfo = () => (
  <div className="absolute bottom-4 right-4 z-30 bg-background/95 backdrop-blur-sm px-4 py-2 rounded-lg border shadow-lg">
    <p className="text-xs text-muted-foreground font-mono">
      SkyRanch - 40°19'3.52"N, 4°28'27.47"W
    </p>
  </div>
);
