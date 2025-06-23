
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, MapPin, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { syncCadastralParcelsToLots, type SimpleSyncResult } from '@/services/cadastralLotSyncService';
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
  const [lastSyncResult, setLastSyncResult] = useState<SimpleSyncResult | null>(null);

  const canSync = propiedadParcelsCount > 0;

  const handleSync = async () => {
    if (!canSync) {
      toast.error('No hay parcelas PROPIEDAD para sincronizar. Ve al Mapa Catastral primero.');
      return;
    }

    setIsSyncing(true);
    
    try {
      console.log('🚀 User clicked sync button - starting simple sync process...');
      toast.info(`Iniciando sincronización de ${propiedadParcelsCount} parcelas PROPIEDAD...`);
      
      const result = await syncCadastralParcelsToLots();
      console.log('🎯 Sync completed, processing result:', result);
      
      setLastSyncResult(result);
      
      if (result.success) {
        if (result.lots_created === 0) {
          toast.info('✅ No se encontraron nuevas parcelas para sincronizar. Todas las parcelas PROPIEDAD ya tienen lotes.');
        } else {
          toast.success(`🎉 Sincronización completada: ${result.lots_created} lotes creados exitosamente`, {
            duration: 5000,
          });
        }
        
        console.log('🎉 Sync successful:', result);
      } else {
        toast.error(`Error: ${result.message}`);
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
    if (lastSyncResult && lastSyncResult.success && lastSyncResult.lots_created > 0) {
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
          ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white border-0' 
          : 'opacity-50 border-gray-300'
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
              {lastSyncResult && lastSyncResult.success && lastSyncResult.lots_created > 0 && (
                <p className="text-xs text-green-600 mt-1">
                  Última sincronización: {lastSyncResult.lots_created} lotes creados
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
