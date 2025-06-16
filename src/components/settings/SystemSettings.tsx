
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Smartphone, Globe } from 'lucide-react';
import DatabaseVersionDisplay from '@/components/app-info/DatabaseVersionDisplay';
import AuthenticationStatusCard from '@/components/lots/AuthenticationStatusCard';
import TimezoneSettings from '@/components/TimezoneSettings';

const SystemSettings = () => {
  return (
    <TabsContent value="system" className="space-y-6">
      <div className="space-y-6">
        {/* Database-backed Version Management */}
        <DatabaseVersionDisplay />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Authentication Status */}
          <AuthenticationStatusCard />
          
          {/* Timezone Settings */}
          <TimezoneSettings />
          
          {/* Project URL */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                URL del Proyecto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <span className="text-sm text-gray-600">URL Principal:</span>
                <p className="text-xs font-mono text-blue-600 break-all p-2 bg-gray-50 rounded border">
                  {window.location.origin}
                </p>
              </div>
              
              <div className="space-y-2">
                <span className="text-sm text-gray-600">Ruta Actual:</span>
                <p className="text-xs font-mono text-gray-500 break-all">
                  {window.location.pathname}
                </p>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Protocolo:</span>
                <span className="text-sm text-green-600 font-medium">
                  {window.location.protocol === 'https:' ? '🔒 HTTPS' : '⚠️ HTTP'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Puerto:</span>
                <span className="text-sm text-gray-500 font-medium">
                  {window.location.port || (window.location.protocol === 'https:' ? '443' : '80')}
                </span>
              </div>
            </CardContent>
          </Card>
          
          {/* Platform Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Smartphone className="w-5 h-5 mr-2" />
                Estado de Plataformas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Plataforma Web:</span>
                <span className="text-sm text-green-600 font-medium">✓ Activa</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Aplicación Móvil:</span>
                <span className="text-sm text-green-600 font-medium">✓ Disponible</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Capacitor:</span>
                <span className="text-sm text-blue-600 font-medium">v7.2.0</span>
              </div>
              
              <div className="space-y-1">
                <span className="text-sm text-gray-600">App ID:</span>
                <p className="text-xs font-mono text-gray-500">
                  app.lovable.4851015cb1c043d19c9f6d125b0fd71b
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Database Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Estado de la Base de Datos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Supabase:</span>
                <span className="text-sm text-green-600 font-medium">✓ Conectado</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Proyecto:</span>
                <span className="text-xs font-mono text-gray-500">ahwhtxygyzoadsmdrwwg</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">RLS Activo:</span>
                <span className="text-sm text-green-600 font-medium">✓ Habilitado</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tablas Principales:</span>
                <span className="text-sm text-blue-600 font-medium">animals, lots, polygons</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TabsContent>
  );
};

export default SystemSettings;
