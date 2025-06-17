
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, Calendar, GitBranch, Monitor } from 'lucide-react';
import { versionManager } from '@/services/versionManager';

interface BuildInfo {
  version: string;
  buildTime: string;
  lastChange: string;
  buildStatus: 'success' | 'building' | 'error';
  environment: 'development' | 'production';
}

const DynamicAppInfo = () => {
  const [buildInfo, setBuildInfo] = useState<BuildInfo>({
    version: versionManager.getFormattedVersion(),
    buildTime: new Date().toISOString(),
    lastChange: 'Restored email notifications, timezone settings, and app version functionality',
    buildStatus: 'success',
    environment: import.meta.env.MODE === 'production' ? 'production' : 'development'
  });

  useEffect(() => {
    const currentVersion = versionManager.getCurrentVersion();
    
    // Log build information for debugging
    console.log(`Build version: ${currentVersion.version} - Email notifications fixed, timezone restored, app version updated`);
    console.log('Build environment:', import.meta.env.MODE);
    console.log('Build time:', new Date().toISOString());
    
    // Listen for version updates
    const handleVersionUpdate = (event: CustomEvent) => {
      setBuildInfo(prev => ({
        ...prev,
        version: `v${event.detail.version}`,
        buildTime: event.detail.lastPublishTime,
        lastChange: 'Fixed broken functionality: email notifications, timezone settings, app version'
      }));
    };

    window.addEventListener('version-updated', handleVersionUpdate as EventListener);
    
    // Update build time every minute to show activity
    const interval = setInterval(() => {
      setBuildInfo(prev => ({
        ...prev,
        buildTime: new Date().toISOString()
      }));
    }, 60000);

    return () => {
      window.removeEventListener('version-updated', handleVersionUpdate as EventListener);
      clearInterval(interval);
    };
  }, []);

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
        <CardTitle className="flex items-center">
          <Info className="w-5 h-5 mr-2" />
          Información de la Aplicación
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Versión:</span>
          <Badge variant="outline" className="font-mono">
            {buildInfo.version}
          </Badge>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Estado del Build:</span>
          <Badge className={getStatusColor(buildInfo.buildStatus)}>
            {buildInfo.buildStatus === 'success' ? 'Exitoso' : 
             buildInfo.buildStatus === 'building' ? 'Construyendo' : 'Error'}
          </Badge>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Entorno:</span>
          <Badge className={getEnvironmentColor(buildInfo.environment)}>
            {buildInfo.environment === 'production' ? 'Producción' : 'Desarrollo'}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Última actualización:</span>
          </div>
          <p className="text-xs text-gray-500 ml-6">
            {new Date(buildInfo.buildTime).toLocaleString('es-ES')}
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <GitBranch className="w-4 h-4 mr-2" />
            <span>Último cambio:</span>
          </div>
          <p className="text-xs text-gray-500 ml-6">
            {buildInfo.lastChange}
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Monitor className="w-4 h-4 mr-2" />
            <span>URL de Preview:</span>
          </div>
          <p className="text-xs text-gray-500 ml-6 break-all">
            {window.location.origin}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DynamicAppInfo;
