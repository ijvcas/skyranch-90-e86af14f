
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Info, RefreshCw, Calendar, GitBranch, Monitor, Hash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { appInfoService, type AppInfo } from '@/services/appInfoService';
import { versionManager } from '@/services/versionManager';

interface AppInfoCardProps {
  appInfo: AppInfo;
}

const AppInfoCard = ({ appInfo }: AppInfoCardProps) => {
  const { toast } = useToast();

  const handleForceRefresh = () => {
    appInfoService.forceRefresh();
    toast({
      title: "Información actualizada",
      description: "La información de la aplicación se ha actualizado automáticamente.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'building':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEnvironmentColor = (env: string) => {
    return env === 'production' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-purple-100 text-purple-800';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Info className="w-5 h-5 mr-2" />
            Información de la Aplicación
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleForceRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Versión:</span>
          <Badge variant="outline" className="font-mono text-lg">
            {appInfo.version}
          </Badge>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Build:</span>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Hash className="w-3 h-3" />
            {appInfo.buildNumber}
          </Badge>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Publicaciones:</span>
          <Badge variant="secondary">
            {versionManager.getPublishCount()}
          </Badge>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Estado del Build:</span>
          <Badge className={getStatusColor(appInfo.buildStatus)}>
            {appInfo.buildStatus === 'success' ? 'Exitoso' : 
             appInfo.buildStatus === 'building' ? 'Construyendo' : 'Error'}
          </Badge>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Entorno:</span>
          <Badge className={getEnvironmentColor(appInfo.environment)}>
            {appInfo.environment === 'production' ? 'Producción' : 'Desarrollo'}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Última actualización:</span>
          </div>
          <p className="text-xs text-gray-500 ml-6">
            {new Date(appInfo.buildTime).toLocaleString('es-ES')}
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <GitBranch className="w-4 h-4 mr-2" />
            <span>Último cambio:</span>
          </div>
          <p className="text-xs text-gray-500 ml-6">
            {appInfo.lastChange}
          </p>
        </div>

        {appInfo.gitCommit && (
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Monitor className="w-4 h-4 mr-2" />
              <span>Commit:</span>
            </div>
            <p className="text-xs font-mono text-gray-500 ml-6">
              {appInfo.gitCommit.substring(0, 8)}
            </p>
          </div>
        )}
        
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Monitor className="w-4 h-4 mr-2" />
            <span>URL de Preview:</span>
          </div>
          <p className="text-xs text-gray-500 ml-6 break-all">
            {window.location.origin}
          </p>
        </div>

        <div className="text-sm">
          <strong>Administrador:</strong> {appInfo.admin}
        </div>
        <div className="text-sm">
          <strong>Descripción:</strong> {appInfo.description}
        </div>
      </CardContent>
    </Card>
  );
};

export default AppInfoCard;
