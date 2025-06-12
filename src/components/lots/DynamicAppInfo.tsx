
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, Calendar, GitBranch, Monitor } from 'lucide-react';

interface BuildInfo {
  version: string;
  buildTime: string;
  lastChange: string;
  buildStatus: 'success' | 'building' | 'error';
  environment: 'development' | 'production';
}

const DynamicAppInfo = () => {
  const [buildInfo, setBuildInfo] = useState<BuildInfo>({
    version: 'v2.2.0',
    buildTime: new Date().toISOString(),
    lastChange: 'Implementadas notificaciones de eventos, controles de visibilidad de lotes y ordenamiento alfabético',
    buildStatus: 'success',
    environment: import.meta.env.MODE === 'production' ? 'production' : 'development'
  });

  useEffect(() => {
    // Log build information for debugging
    console.log('Build version: v2.2.0 - Event notifications, lot visibility controls, and alphabetical sorting implemented');
    console.log('Build environment:', import.meta.env.MODE);
    console.log('Build time:', new Date().toISOString());
    
    // Simulate checking for updates every 30 seconds
    const interval = setInterval(() => {
      setBuildInfo(prev => ({
        ...prev,
        buildTime: new Date().toISOString()
      }));
    }, 30000);

    return () => clearInterval(interval);
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
