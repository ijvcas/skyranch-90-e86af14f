
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, X, HelpCircle, Mail, Phone, RefreshCw, Wifi, WifiOff, Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { appInfoService, type SupportInfo } from '@/services/appInfoService';

interface SupportCardProps {
  supportInfo: SupportInfo;
  isAdmin: boolean;
  isOnline: boolean;
}

const SupportCard = ({ supportInfo, isAdmin, isOnline }: SupportCardProps) => {
  const { toast } = useToast();
  const [isEditingSupport, setIsEditingSupport] = useState(false);
  const [tempSupportInfo, setTempSupportInfo] = useState(supportInfo);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Update temp info when props change
  React.useEffect(() => {
    setTempSupportInfo(supportInfo);
  }, [supportInfo]);

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

  return (
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
  );
};

export default SupportCard;
