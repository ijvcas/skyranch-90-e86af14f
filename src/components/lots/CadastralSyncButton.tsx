
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, MapPin, Zap, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { syncCadastralParcelsToLots, type BidirectionalSyncResult } from '@/services/cadastralLotSyncService';
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
  size = "sm",
  variant = "outline"
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<BidirectionalSyncResult | null>(null);

  const handleSync = async () => {
    setIsSyncing(true);
    
    try {
      console.log('🚀 User clicked sync button - starting bidirectional sync process...');
      toast.info('Iniciando sincronización bidireccional...');
      
      const result = await syncCadastralParcelsToLots();
      console.log('🎯 Bidirectional sync completed, processing result:', result);
      
      setLastSyncResult(result);
      
      if (result.success) {
        if (result.lots_created === 0 && result.lots_deleted === 0) {
          toast.info('✅ Sincronización completada: No se encontraron cambios necesarios.');
        } else {
          let message = '🎉 Sincronización completada: ';
          const parts = [];
          
          if (result.lots_created > 0) {
            parts.push(`${result.lots_created} lotes creados`);
          }
          
          if (result.lots_deleted > 0) {
            parts.push(`${result.lots_deleted} lotes eliminados`);
          }
          
          message += parts.join(', ');
          
          toast.success(message, {
            duration: 5000,
          });
        }
        
        console.log('🎉 Bidirectional sync successful:', result);
      } else {
        toast.error(`Error: ${result.message}`);
      }
      
      // Always call onSyncComplete to refresh the UI
      if (onSyncComplete) {
        console.log('🔄 Triggering UI refresh...');
        onSyncComplete();
      }
      
    } catch (error) {
      console.error('❌ Bidirectional sync failed with error:', error);
      
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
    if (lastSyncResult && lastSyncResult.success && (lastSyncResult.lots_created > 0 || lastSyncResult.lots_deleted > 0)) {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
    return <AlertTriangle className="w-4 h-4 text-orange-600" />;
  };

  const buttonContent = (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          disabled={isSyncing}
          variant={variant}
          size={size}
          className={`flex items-center space-x-2 ${className} border-orange-300 text-orange-700 hover:bg-orange-50`}
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
            Confirmar Sincronización Bidireccional
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              ¿Estás seguro de que deseas sincronizar los lotes con los datos catastrales?
            </p>
            <p className="text-sm text-gray-600">
              Esta acción realizará una sincronización bidireccional:
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside ml-2 space-y-1">
              <li>Creará nuevos lotes para parcelas marcadas como PROPIEDAD</li>
              <li>Eliminará lotes cuyas parcelas ya no son PROPIEDAD</li>
              <li>Los lotes creados manualmente no se verán afectados</li>
            </ul>
            {lastSyncResult && lastSyncResult.success && (
              <p className="text-xs text-green-600 mt-2">
                Última sincronización: {lastSyncResult.lots_created} creados, {lastSyncResult.lots_deleted} eliminados
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
          <div>
            <p className="font-medium">Sincronización Bidireccional</p>
            <p className="text-sm">Crea y elimina lotes basados en el estado actual de las parcelas PROPIEDAD</p>
            <p className="text-xs text-orange-600 mt-1">
              ⚠️ Requiere confirmación para evitar clicks accidentales
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CadastralSyncButton;
