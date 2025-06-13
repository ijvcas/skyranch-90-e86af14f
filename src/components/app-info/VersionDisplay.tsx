
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Rocket, GitBranch, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { versionManager, type VersionInfo } from '@/services/versionManager';

const VersionDisplay = () => {
  const { toast } = useToast();
  const [versionInfo, setVersionInfo] = useState<VersionInfo>(versionManager.getCurrentVersion());

  useEffect(() => {
    const handleVersionUpdate = (event: CustomEvent) => {
      setVersionInfo(event.detail);
      console.log('🔄 Version updated:', event.detail);
    };

    window.addEventListener('version-updated', handleVersionUpdate as EventListener);
    
    return () => {
      window.removeEventListener('version-updated', handleVersionUpdate as EventListener);
    };
  }, []);

  const handleSimulatePublish = () => {
    versionManager.triggerPublishUpdate();
    toast({
      title: "Versión actualizada",
      description: `Nueva versión: v${versionManager.getCurrentVersion().version}`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Rocket className="w-5 h-5 mr-2" />
            Control de Versiones
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSimulatePublish}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Simular Publicación
          </Button>
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
          <span className="text-sm text-gray-600">Publicaciones:</span>
          <Badge variant="secondary">
            {versionInfo.publishCount}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            <span>Última Publicación:</span>
          </div>
          <p className="text-xs text-gray-500 ml-6">
            {new Date(versionInfo.lastPublishTime).toLocaleString('es-ES')}
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <GitBranch className="w-4 h-4 mr-2" />
            <span>Sistema de Versionado:</span>
          </div>
          <p className="text-xs text-gray-500 ml-6">
            Automático • Incrementa con cada publicación
          </p>
        </div>
        
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Cómo funciona:</strong> Cada vez que publiques la aplicación, 
            la versión se incrementará automáticamente (ej: v2.3.0 → v2.3.1).
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default VersionDisplay;
