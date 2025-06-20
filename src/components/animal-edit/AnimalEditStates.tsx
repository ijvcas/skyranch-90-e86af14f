
import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface AnimalEditStatesProps {
  isLoading?: boolean;
  error?: any;
  animal?: any;
  permissionError?: string | null;
  onNavigateBack: () => void;
}

const AnimalEditStates: React.FC<AnimalEditStatesProps> = ({
  isLoading,
  error,
  animal,
  permissionError,
  onNavigateBack
}) => {
  if (isLoading) {
    return (
      <div className="page-with-logo">
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-2">Cargando animal...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !animal) {
    return (
      <div className="page-with-logo">
        <div className="container mx-auto py-6">
          <Alert className="border-red-200 bg-red-50 max-w-md mx-auto">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              No se pudo cargar el animal.
            </AlertDescription>
          </Alert>
          <div className="flex justify-center mt-4">
            <Button onClick={onNavigateBack} variant="outline">
              Volver a Animales
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (permissionError) {
    return (
      <div className="page-with-logo">
        <div className="container mx-auto py-6">
          <Alert className="border-red-200 bg-red-50 max-w-md mx-auto">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {permissionError}
            </AlertDescription>
          </Alert>
          <div className="flex justify-center mt-4">
            <Button onClick={onNavigateBack} variant="outline">
              Volver a Animales
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AnimalEditStates;
