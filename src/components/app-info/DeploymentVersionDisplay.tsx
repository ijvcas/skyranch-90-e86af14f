
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDeploymentVersion } from '@/hooks/useDeploymentVersion';
import DeploymentVersionHeader from './deployment/DeploymentVersionHeader';
import DeploymentVersionInfo from './deployment/DeploymentVersionInfo';
import DeploymentVersionCards from './deployment/DeploymentVersionCards';

const DeploymentVersionDisplay = () => {
  const {
    versionInfo,
    isRefreshing,
    handleManualIncrement,
    handleForceRefresh,
    handleCheckDeployment
  } = useDeploymentVersion();

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <DeploymentVersionHeader
            isRefreshing={isRefreshing}
            onForceRefresh={handleForceRefresh}
            onCheckDeployment={handleCheckDeployment}
            onManualIncrement={handleManualIncrement}
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <DeploymentVersionInfo versionInfo={versionInfo} />
        <DeploymentVersionCards />
      </CardContent>
    </Card>
  );
};

export default DeploymentVersionDisplay;
