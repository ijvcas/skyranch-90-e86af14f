
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, Globe, GitBranch, Hash } from 'lucide-react';
import type { DeploymentVersion } from '@/services/deployment/types';

interface DeploymentVersionInfoProps {
  versionInfo: DeploymentVersion;
}

const DeploymentVersionInfo = ({ versionInfo }: DeploymentVersionInfoProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Versión Actual:</span>
        <Badge variant="outline" className="font-mono text-lg">
          v{versionInfo.version}
        </Badge>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Número de Build:</span>
        <Badge variant="secondary">
          #{versionInfo.buildNumber}
        </Badge>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Deployment ID:</span>
        <Badge variant="secondary" className="font-mono">
          {versionInfo.deploymentId}
        </Badge>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Deployment #:</span>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Hash className="w-3 h-3" />
          {versionInfo.deploymentNumber}
        </Badge>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-2" />
          <span>Último Deployment:</span>
        </div>
        <p className="text-xs text-gray-500 ml-6">
          {new Date(versionInfo.lastDeploymentTime).toLocaleString('es-ES')}
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center text-sm text-gray-600">
          <Globe className="w-4 h-4 mr-2" />
          <span>URL de Deployment:</span>
        </div>
        <p className="text-xs text-gray-500 ml-6 break-all">
          {versionInfo.deploymentUrl}
        </p>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center text-sm text-gray-600">
          <GitBranch className="w-4 h-4 mr-2" />
          <span>Último Cambio:</span>
        </div>
        <p className="text-xs text-gray-500 ml-6">
          {versionInfo.lastChange}
        </p>
      </div>
    </div>
  );
};

export default DeploymentVersionInfo;
