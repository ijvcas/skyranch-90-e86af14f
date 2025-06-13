
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Rocket, GitBranch, Clock, TestTube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { buildTimeVersionService } from '@/services/buildTimeVersionService';

const BuildTimeVersionDisplay = () => {
  const { toast } = useToast();
  const [versionInfo, setVersionInfo] = useState(buildTimeVersionService.getCurrentVersion());

  useEffect(() => {
    const handleVersionUpdate = (event: CustomEvent) => {
      setVersionInfo(event.detail);
      console.log('🔄 Build version updated:', event.detail);
    };

    window.addEventListener('build-version-updated', handleVersionUpdate as EventListener);
    
    return () => {
      window.removeEventListener('build-version-updated', handleVersionUpdate as EventListener);
    };
  }, []);

  const handleTestIncrement = () => {
    const newVersion = buildTimeVersionService.forceIncrement();
    toast({
      title: "Versión incrementada (Prueba)",
      description: `Nueva versión: v${newVersion.version} - Build #${newVersion.buildNumber}`,
    });
  };

  const handleRefresh = () => {
    setVersionInfo(buildTimeVersionService.getCurrentVersion());
    toast({
      title: "Información actualizada",
      description: "Se ha recargado la información de versión actual.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Rocket className="w-5 h-5 mr-2" />
            Versión de Build
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestIncrement}
              className="flex items-center gap-2"
            >
              <TestTube className="w-4 h-4" />
              Probar Incremento
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
          <span className="text-sm text-gray-600">Build ID:</span>
          <Badge variant="secondary" className="font-mono">
            {versionInfo.buildId}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            <span>Tiempo de Build:</span>
          </div>
          <p className="text-xs text-gray-500 ml-6">
            {new Date(versionInfo.buildTime).toLocaleString('es-ES')}
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

        {versionInfo.gitCommit && (
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <GitBranch className="w-4 h-4 mr-2" />
              <span>Git Commit:</span>
            </div>
            <p className="text-xs font-mono text-gray-500 ml-6">
              {versionInfo.gitCommit}
            </p>
          </div>
        )}
        
        <div className="bg-amber-50 p-3 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>Detección Automática:</strong> La versión se incrementa automáticamente 
            cuando Lovable detecta un nuevo build (basado en el tiempo de construcción).
          </p>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Cómo probar:</strong> Usa "Publish Update" en Lovable y luego recarga 
            la página. El sistema detectará el nuevo build y incrementará la versión automáticamente.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BuildTimeVersionDisplay;
