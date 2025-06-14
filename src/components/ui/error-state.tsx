
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import PageLayout from './page-layout';

interface ErrorStateProps {
  title?: string;
  message?: string;
  userEmail?: string;
  onRetry?: () => void;
  onReload?: () => void;
}

const ErrorState = ({ 
  title = "Error al cargar", 
  message = "Ocurrió un error inesperado.",
  userEmail,
  onRetry,
  onReload
}: ErrorStateProps) => {
  return (
    <PageLayout className="flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
        {userEmail && (
          <p className="text-gray-600 mb-4">Usuario: {userEmail}</p>
        )}
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="space-y-2">
          {onRetry && (
            <Button onClick={onRetry} className="bg-blue-600 hover:bg-blue-700 w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
          )}
          {onReload && (
            <Button onClick={onReload} variant="outline" className="w-full">
              Recargar Página
            </Button>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default ErrorState;
