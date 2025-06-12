
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings as SettingsIcon, Smartphone, Globe, Database } from 'lucide-react';
import DynamicAppInfo from '@/components/lots/DynamicAppInfo';
import AuthenticationStatusCard from '@/components/lots/AuthenticationStatusCard';
import UserManagement from '@/components/UserManagement';

const Settings = () => {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Configuración del Sistema</h1>
        <p className="text-gray-500">Estado y configuración de la aplicación</p>
      </div>

      <div className="space-y-6">
        {/* User Management Section */}
        <UserManagement />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dynamic App Info */}
          <DynamicAppInfo />
          
          {/* Authentication Status */}
          <AuthenticationStatusCard />
          
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
    </div>
  );
};

export default Settings;
