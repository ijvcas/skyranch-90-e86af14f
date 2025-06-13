
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Rocket, GitBranch, Clock, TestTube, Globe, Hash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { deploymentVersionService } from '@/services/deploymentVersionService';

const DeploymentVersionDisplay = () => {
  const { toast } = useToast();
  const [versionInfo, setVersionInfo] = useState(deploymentVersionService.getCurrentVersion());

  useEffect(() => {
    const handleVersionUpdate = (event: CustomEvent) => {
      setVersionInfo(event.detail);
      console.log('🔄 Deployment version updated:', event.detail);
    };

    window.addEventListener('deployment-version-updated', handleVersionUpdate as EventListener);
    
    return () => {
      window.removeEventListener('deployment-version-updated', handleVersionUpdate as EventListener);
    };
  }, []);

  const handleManualIncrement = () => {
    const newVersion = deploymentVersionService.manualIncrement();
    toast({
      title: "Versión incrementada manualmente",
      description: `Nueva versión: v${newVersion.version} - Build #${newVersion.buildNumber}`,
    });
  };

  const handleCheckDeployment = () => {
    const foundNewDeployment = deploymentVersionService.checkForNewDeployment();
    if (foundNewDeployment) {
      toast({
        title: "Nueva versión detectada",
        description: "Se detectó un nuevo deployment y se incrementó la versión.",
      });
    } else {
      toast({
        title: "Sin cambios",
        description: "No se detectaron nuevos deployments.",
      });
    }
  };

  const handleRefresh = () => {
    setVersionInfo(deploymentVersionService.getCurrentVersion());
    toast({
      title: "Información actualizada",
      description: "Se ha recargado la información de versión actual.",
    });
  };

  const deploymentInfo = deploymentVersionService.getDeploymentInfo();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Rocket className="w-5 h-5 mr-2" />
            Sistema de Versionado Automático
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCheckDeployment}
              className="flex items-center gap-2"
            >
              <Globe className="w-4 h-4" />
              Verificar Deployment
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualIncrement}
              className="flex items-center gap-2"
            >
              <TestTube className="w-4 h-4" />
              Incrementar Manual
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Actualizar
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
        
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>Detección Automática Mejorada:</strong> El sistema ahora detecta automáticamente 
            cuando publicas actualizaciones en Lovable analizando la URL de deployment.
          </p>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Cómo funciona:</strong> Cada vez que uses "Publish Update" en Lovable, 
            la URL del deployment cambia y el sistema detecta esto automáticamente para 
            incrementar la versión.
          </p>
        </div>

        <div className="bg-amber-50 p-3 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>Verificación Manual:</strong> Si la versión no se incrementa automáticamente, 
            puedes usar "Incrementar Manual" o "Verificar Deployment" para forzar la actualización.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeploymentVersionDisplay;
