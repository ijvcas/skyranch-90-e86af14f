
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, MapPin, Zap, CheckCircle, AlertCircle } from 'lucide-react';
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
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult[] | null>(null);

  const canSync = propiedadParcelsCount > 0;

  const handleSync = async () => {
    if (!canSync) {
      toast.error('No hay parcelas PROPIEDAD para sincronizar. Ve al Mapa Catastral primero.');
      return;
    }

    setIsSyncing(true);
    
    try {
      console.log('🚀 User clicked sync button - starting sync process...');
      toast.info(`Iniciando sincronización de ${propiedadParcelsCount} parcelas PROPIEDAD...`);
      
      const results = await syncCadastralParcelsToLots();
      console.log('🎯 Sync completed, processing results:', results);
      
      setLastSyncResult(results);
      
      if (results.length === 0) {
        toast.info('✅ No se encontraron cambios. Todas las parcelas PROPIEDAD ya están sincronizadas.');
        console.log('ℹ️ No changes needed - all parcels already synced');
      } else {
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
        
        toast.success(message, {
          duration: 5000,
        });
        
        console.log('🎉 Sync results summary:', { created, updated, deleted, total: results.length });
      }
      
      // Always call onSyncComplete to refresh the UI
      if (onSyncComplete) {
        console.log('🔄 Triggering UI refresh...');
        onSyncComplete();
      }
      
    } catch (error) {
      console.error('❌ Sync failed with error:', error);
      
      let errorMessage = 'Error al sincronizar con datos catastrales.';
      if (error instanceof Error) {
        errorMessage += ` ${error.message}`;
      }
      
      toast.error(errorMessage, {
        description: 'Revisa la consola del navegador para más detalles.',
        duration: 8000,
      });
      
      setLastSyncResult(null);
    } finally {
      setIsSyncing(false);
    }
  };

  const getButtonIcon = () => {
    if (isSyncing) {
      return <RefreshCw className="w-4 h-4 animate-spin" />;
    }
    if (lastSyncResult && lastSyncResult.length > 0) {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
    if (!canSync) {
      return <AlertCircle className="w-4 h-4 text-amber-600" />;
    }
    return <Zap className="w-4 h-4" />;
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
      {getButtonIcon()}
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
              {lastSyncResult && lastSyncResult.length > 0 && (
                <p className="text-xs text-green-600 mt-1">
                  Última sincronización: {lastSyncResult.length} operaciones
                </p>
              )}
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
