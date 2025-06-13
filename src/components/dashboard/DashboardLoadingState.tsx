
import React from 'react';
import { RefreshCw } from 'lucide-react';

interface DashboardLoadingStateProps {
  userEmail?: string;
}

const DashboardLoadingState = ({ userEmail }: DashboardLoadingStateProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center pt-16">
      <div className="text-center">
        <RefreshCw className="w-8 h-8 animate-spin text-gray-600 mx-auto mb-4" />
        <div className="text-lg text-gray-600">Cargando aplicación...</div>
        <div className="text-sm text-gray-500 mt-2">Usuario: {userEmail}</div>
      </div>
    </div>
  );
};

export default DashboardLoadingState;
