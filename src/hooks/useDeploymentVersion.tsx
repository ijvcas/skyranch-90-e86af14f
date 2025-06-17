
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { deploymentVersionService } from '@/services/deploymentVersionService';

export const useDeploymentVersion = () => {
  const { toast } = useToast();
  const [versionInfo, setVersionInfo] = useState(deploymentVersionService.getCurrentVersion());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const handleVersionUpdate = (event: CustomEvent) => {
      setVersionInfo(event.detail);
      console.log('🔄 Deployment version updated:', event.detail);
      toast({
        title: "¡Nueva versión detectada!",
        description: `Versión actualizada a v${event.detail.version}`,
      });
    };

    window.addEventListener('deployment-version-updated', handleVersionUpdate as EventListener);
    
    return () => {
      window.removeEventListener('deployment-version-updated', handleVersionUpdate as EventListener);
    };
  }, [toast]);

  const handleManualIncrement = () => {
    const newVersion = deploymentVersionService.manualIncrement();
    toast({
      title: "Versión incrementada manualmente",
      description: `Nueva versión: v${newVersion.version} - Build #${newVersion.buildNumber}`,
    });
  };

  const handleForceRefresh = async () => {
    setIsRefreshing(true);
    try {
      deploymentVersionService.forceRefresh();
      toast({
        title: "Verificación completa",
        description: "Se ha verificado el estado del deployment actual.",
      });
    } catch (error) {
      toast({
        title: "Error al verificar",
        description: "Hubo un problema al verificar el deployment.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCheckDeployment = () => {
    const foundNewDeployment = deploymentVersionService.checkForNewDeployment();
    if (foundNewDeployment) {
      toast({
        title: "¡Nueva versión detectada!",
        description: "Se detectó un nuevo deployment y se incrementó la versión automáticamente.",
      });
    } else {
      toast({
        title: "Sin cambios detectados",
        description: "No se encontraron nuevos deployments. Si acabas de publicar, espera unos minutos y vuelve a intentar.",
      });
    }
  };

  return {
    versionInfo,
    isRefreshing,
    handleManualIncrement,
    handleForceRefresh,
    handleCheckDeployment
  };
};
