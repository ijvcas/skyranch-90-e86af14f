import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useFarm } from '@/hooks/useFarm';
import LoadingState from '@/components/ui/loading-state';

interface ProtectedFarmRouteProps {
  children: React.ReactNode;
}

const ProtectedFarmRoute: React.FC<ProtectedFarmRouteProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { hasFarm, isLoadingFarms } = useFarm();

  // Show loading while checking auth or farm status
  if (authLoading || isLoadingFarms) {
    return <LoadingState message="Verificando acceso..." userEmail={user?.email} />;
  }

  // Not authenticated - redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // No farm - redirect to setup
  if (!hasFarm) {
    return <Navigate to="/setup-farm" replace />;
  }

  return <>{children}</>;
};

export default ProtectedFarmRoute;