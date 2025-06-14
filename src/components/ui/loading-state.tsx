
import React from 'react';
import { RefreshCw } from 'lucide-react';
import PageLayout from './page-layout';

interface LoadingStateProps {
  message?: string;
  userEmail?: string;
}

const LoadingState = ({ message = "Cargando...", userEmail }: LoadingStateProps) => {
  return (
    <PageLayout className="flex items-center justify-center">
      <div className="text-center">
        <RefreshCw className="w-8 h-8 animate-spin text-gray-600 mx-auto mb-4" />
        <div className="text-lg text-gray-600">{message}</div>
        {userEmail && (
          <div className="text-sm text-gray-500 mt-2">Usuario: {userEmail}</div>
        )}
      </div>
    </PageLayout>
  );
};

export default LoadingState;
