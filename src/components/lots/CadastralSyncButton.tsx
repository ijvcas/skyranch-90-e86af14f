
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, MapPin, Zap, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { syncCadastralParcelsToLots, type SimpleSyncResult } from '@/services/cadastralLotSyncService';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

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
  size = "sm", // Changed default to sm
  variant = "outline" // Changed default to outline
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
    return <AlertTriangle className="w-4 h-4 text-orange-600" />;
  };

  const buttonContent = (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          disabled={isSyncing || !canSync}
          variant={canSync ? variant : "outline"}
          size={size}
          className={`flex items-center space-x-2 ${className} ${
            canSync 
              ? 'border-orange-300 text-orange-700 hover:bg-orange-50' 
              : 'opacity-50 border-gray-300'
          }`}
        >
          {getButtonIcon()}
          <MapPin className="w-4 h-4" />
          <span className="font-medium">
            {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
          </span>
          {propiedadParcelsCount > 0 && (
            <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
              {propiedadParcelsCount}
            </span>
          )}
        </Button>
      </AlertDialogTrigger>
      
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Confirmar Sincronización Catastral
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              ¿Estás seguro de que deseas sincronizar {propiedadParcelsCount} parcelas PROPIEDAD?
            </p>
            <p className="text-sm text-gray-600">
              Esta acción creará automáticamente nuevos lotes basados en las parcelas catastrales marcadas como PROPIEDAD. 
              Los lotes existentes no se verán afectados.
            </p>
            {lastSyncResult && lastSyncResult.success && lastSyncResult.lots_created > 0 && (
              <p className="text-xs text-green-600 mt-2">
                Última sincronización: {lastSyncResult.lots_created} lotes creados
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleSync} className="bg-orange-600 hover:bg-orange-700">
            Sincronizar Ahora
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
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
              <p className="text-xs text-orange-600 mt-1">
                ⚠️ Requiere confirmación para evitar clicks accidentales
              </p>
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
