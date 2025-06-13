import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Save, X, Info, HelpCircle, Mail, Phone, RefreshCw, Calendar, GitBranch, Monitor, Wifi, WifiOff } from 'lucide-react';
import { Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { appInfoService, type AppInfo, type SupportInfo } from '@/services/appInfoService';

interface UnifiedAppInfoProps {
  isAdmin: boolean;
  showSupportCard?: boolean;
}

const UnifiedAppInfo = ({ isAdmin, showSupportCard = true }: UnifiedAppInfoProps) => {
  const { toast } = useToast();
  
  const [appInfo, setAppInfo] = useState<AppInfo>(appInfoService.getAppInfo());
  const [supportInfo, setSupportInfo] = useState<SupportInfo>(appInfoService.getSupportInfo());
  const [isEditingSupport, setIsEditingSupport] = useState(false);
  const [tempSupportInfo, setTempSupportInfo] = useState(supportInfo);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Listen for automatic updates
    const handleAppInfoUpdate = (event: CustomEvent) => {
      setAppInfo(event.detail);
      console.log('🔄 App info updated in component:', event.detail);
    };

    const handleSupportInfoUpdate = (event: CustomEvent) => {
      setSupportInfo(event.detail);
      setTempSupportInfo(event.detail);
      console.log('🔄 Support info updated in component:', event.detail);
    };

    // Listen for online/offline status
    const handleOnline = () => {
      setIsOnline(true);
      // Refresh support info when coming back online
      if (appInfoService.supportInfoManager) {
        appInfoService.supportInfoManager.refreshFromDatabase();
      }
    };

    const handleOffline = () => setIsOnline(false);

    window.addEventListener('app-info-updated', handleAppInfoUpdate as EventListener);
    window.addEventListener('support-info-updated', handleSupportInfoUpdate as EventListener);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('app-info-updated', handleAppInfoUpdate as EventListener);
      window.removeEventListener('support-info-updated', handleSupportInfoUpdate as EventListener);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleForceRefresh = () => {
    appInfoService.forceRefresh();
    toast({
      title: "Información actualizada",
      description: "La información de la aplicación se ha actualizado automáticamente.",
    });
  };

  const handleRefreshSupport = async () => {
    if (!appInfoService.supportInfoManager) return;
    
    setIsRefreshing(true);
    try {
      await appInfoService.supportInfoManager.refreshFromDatabase();
      toast({
        title: "Información sincronizada",
        description: "La información de soporte se ha sincronizado desde la base de datos.",
      });
    } catch (error) {
      console.error('Failed to refresh support info:', error);
      toast({
        title: "Error de sincronización",
        description: "No se pudo sincronizar la información de soporte.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSaveSupport = async () => {
    if (!appInfoService.supportInfoManager) return;
    
    try {
      await appInfoService.supportInfoManager.updateSupportInfo(tempSupportInfo);
      setIsEditingSupport(false);
      toast({
        title: "Información actualizada",
        description: "La información de soporte técnico ha sido actualizada y sincronizada.",
      });
    } catch (error) {
      console.error('Failed to save support info:', error);
      toast({
        title: "Error al guardar",
        description: "No se pudo guardar la información de soporte.",
        variant: "destructive"
      });
    }
  };

  const handleCancelSupportEdit = () => {
    setTempSupportInfo(supportInfo);
    setIsEditingSupport(false);
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* App Information Card */}
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
            <Badge variant="outline" className="font-mono">
              {appInfo.version}
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

      {/* Support Card */}
      {showSupportCard && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-orange-600" />
              Soporte Técnico
              <div className="flex items-center gap-2 ml-auto">
                {/* Online/Offline indicator */}
                <div className="flex items-center gap-1 text-xs">
                  {isOnline ? (
                    <Wifi className="w-3 h-3 text-green-600" />
                  ) : (
                    <WifiOff className="w-3 h-3 text-red-600" />
                  )}
                  <span className={isOnline ? 'text-green-600' : 'text-red-600'}>
                    {isOnline ? 'En línea' : 'Sin conexión'}
                  </span>
                </div>
                
                {/* Refresh button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefreshSupport}
                  disabled={isRefreshing || !isOnline}
                  className="bg-orange-50 hover:bg-orange-100 p-1"
                  title="Sincronizar información de soporte"
                >
                  <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
                
                {/* Edit button */}
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingSupport(!isEditingSupport)}
                    className="bg-orange-50 hover:bg-orange-100"
                    title="Editar información de soporte técnico"
                  >
                    {isEditingSupport ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                  </Button>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isEditingSupport ? (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="support-email">Email de Soporte</Label>
                  <Input
                    id="support-email"
                    value={tempSupportInfo.email}
                    onChange={(e) => setTempSupportInfo({...tempSupportInfo, email: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="support-phone">Teléfono de Soporte</Label>
                  <Input
                    id="support-phone"
                    value={tempSupportInfo.phone}
                    onChange={(e) => setTempSupportInfo({...tempSupportInfo, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="support-hours">Horario de Atención</Label>
                  <Input
                    id="support-hours"
                    value={tempSupportInfo.hours}
                    onChange={(e) => setTempSupportInfo({...tempSupportInfo, hours: e.target.value})}
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveSupport}>
                    <Save className="w-4 h-4 mr-1" />
                    Guardar
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancelSupportEdit}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span>{supportInfo.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span>{supportInfo.phone}</span>
                </div>
                <div className="text-sm">
                  <strong>Horario:</strong> {supportInfo.hours}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => window.open(`mailto:${supportInfo.email}`, '_blank')}
                >
                  Contactar Soporte
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UnifiedAppInfo;
