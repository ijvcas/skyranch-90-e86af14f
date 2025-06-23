
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, MapPin } from 'lucide-react';
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
}

const CadastralSyncButton: React.FC<CadastralSyncButtonProps> = ({ onSyncComplete }) => {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    
    try {
      const results = await syncCadastralParcelsToLots();
      
      if (results.length === 0) {
        toast.info('No hay parcelas PROPIEDAD para sincronizar');
        return;
      }
      
      const created = results.filter(r => r.action === 'CREATED').length;
      const updated = results.filter(r => r.action === 'UPDATED').length;
      const deleted = results.filter(r => r.action === 'DELETED').length;
      
      let message = 'Sincronización completada: ';
      const parts = [];
      if (created > 0) parts.push(`${created} lotes creados`);
      if (updated > 0) parts.push(`${updated} lotes actualizados`);
      if (deleted > 0) parts.push(`${deleted} lotes eliminados`);
      
      message += parts.join(', ');
      toast.success(message);
      
      console.log('🎉 Sync results:', { created, updated, deleted, results });
      
      if (onSyncComplete) {
        onSyncComplete();
      }
    } catch (error) {
      console.error('❌ Sync failed:', error);
      toast.error('Error al sincronizar con datos catastrales');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleSync}
            disabled={isSyncing}
            variant="outline"
            size="sm"
            className="h-10 flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <MapPin className="w-4 h-4" />
            <span>Sincronizar Catastral</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Generar lotes automáticamente desde parcelas PROPIEDAD</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CadastralSyncButton;
