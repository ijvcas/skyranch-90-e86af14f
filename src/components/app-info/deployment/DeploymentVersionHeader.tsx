
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Globe, TestTube, Rocket } from 'lucide-react';

interface DeploymentVersionHeaderProps {
  isRefreshing: boolean;
  onForceRefresh: () => void;
  onCheckDeployment: () => void;
  onManualIncrement: () => void;
}

const DeploymentVersionHeader = ({
  isRefreshing,
  onForceRefresh,
  onCheckDeployment,
  onManualIncrement
}: DeploymentVersionHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <Rocket className="w-5 h-5 mr-2" />
        Sistema de Versionado Automático
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onForceRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Verificando...' : 'Forzar Actualización'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onCheckDeployment}
          className="flex items-center gap-2"
        >
          <Globe className="w-4 h-4" />
          Verificar Deployment
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onManualIncrement}
          className="flex items-center gap-2"
        >
          <TestTube className="w-4 h-4" />
          Incrementar Manual
        </Button>
      </div>
    </div>
  );
};

export default DeploymentVersionHeader;
