
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, MapPin, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { syncCadastralParcelsToLots, type SyncResult } from '@/services/cadastralLotSyncService';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CadastralSyncButtonProps {
  onSyncComplete?: () => void;
  propiedadParcelsCount?: number;
  className?: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "secondary";
}

const CadastralSyncButton: React.FC<CadastralSyncButtonProps> = ({ 
  onSyncComplete, 
  propiedadParcelsCount = 0,
  className = "",
  size = "default",
  variant = "default"
}) => {
  const [isSyncing, setIsSyncing] = useState(false);

  const canSync = propiedadParcelsCount > 0;

  const handleSync = async () => {
    if (!canSync) {
      toast.error('No hay parcelas PROPIEDAD para sincronizar. Ve al Mapa Catastral primero.');
      return;
    }

    setIsSyncing(true);
    
    try {
      toast.info('Iniciando sincronización de parcelas catastrales...');
      const results = await syncCadastralParcelsToLots();
      
      if (results.length === 0) {
        toast.info('No se encontraron cambios. Todas las parcelas PROPIEDAD ya están sincronizadas.');
        return;
      }
      
      const created = results.filter(r => r.action === 'CREATED').length;
      const updated = results.filter(r => r.action === 'UPDATED').length;
      const deleted = results.filter(r => r.action === 'DELETED').length;
      
      let message = '🎉 Sincronización completada exitosamente';
      const details = [];
      if (created > 0) details.push(`${created} lotes creados`);
      if (updated > 0) details.push(`${updated} lotes actualizados`);
      if (deleted > 0) details.push(`${deleted} lotes eliminados`);
      
      if (details.length > 0) {
        message += `: ${details.join(', ')}`;
      }
      
      toast.success(message);
      console.log('🎉 Sync results:', { created, updated, deleted, total: results.length });
      
      if (onSyncComplete) {
        onSyncComplete();
      }
    } catch (error) {
      console.error('❌ Sync failed:', error);
      toast.error('Error al sincronizar con datos catastrales. Revisa la consola para más detalles.');
    } finally {
      setIsSyncing(false);
    }
  };

  const buttonContent = (
    <Button
      onClick={handleSync}
      disabled={isSyncing || !canSync}
      variant={canSync ? variant : "outline"}
      size={size}
      className={`flex items-center space-x-2 ${className} ${
        canSync 
          ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white' 
          : 'opacity-50'
      }`}
    >
      {isSyncing ? (
        <RefreshCw className="w-4 h-4 animate-spin" />
      ) : (
        <Zap className="w-4 h-4" />
      )}
      <MapPin className="w-4 h-4" />
      <span className="font-medium">
        {isSyncing ? 'Sincronizando...' : 'Sincronizar Catastral'}
      </span>
      {propiedadParcelsCount > 0 && (
        <span className="bg-white bg-opacity-20 text-xs px-2 py-1 rounded-full">
          {propiedadParcelsCount}
        </span>
      )}
    </Button>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {buttonContent}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          {canSync ? (
            <div>
              <p className="font-medium">Generar lotes automáticamente</p>
              <p className="text-sm">Crea lotes basados en {propiedadParcelsCount} parcelas PROPIEDAD</p>
            </div>
          ) : (
            <div>
              <p className="font-medium">Sin parcelas PROPIEDAD</p>
              <p className="text-sm">Ve al Mapa Catastral y marca parcelas como PROPIEDAD primero</p>
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CadastralSyncButton;
