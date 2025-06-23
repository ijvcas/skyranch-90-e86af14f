
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bug, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { debugCadastralParcelsData, updateExistingLotsWithCorrectNames } from '@/services/lotDebugService';

interface DebugLotsButtonProps {
  onUpdateComplete?: () => void;
}

const DebugLotsButton: React.FC<DebugLotsButtonProps> = ({ onUpdateComplete }) => {
  const [isDebugging, setIsDebugging] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleDebug = async () => {
    setIsDebugging(true);
    try {
      toast.info('Revisando datos catastrales...');
      const parcels = await debugCadastralParcelsData();
      toast.success(`Datos revisados. Ver consola para detalles de ${parcels?.length || 0} parcelas.`);
    } catch (error) {
      toast.error('Error al revisar datos catastrales');
    } finally {
      setIsDebugging(false);
    }
  };

  const handleUpdateExisting = async () => {
    setIsUpdating(true);
    try {
      toast.info('Actualizando nombres de lotes existentes...');
      const result = await updateExistingLotsWithCorrectNames();
      
      if (result.success) {
        if (result.updated > 0) {
          toast.success(`✅ Se actualizaron ${result.updated} nombres de lotes`);
          onUpdateComplete?.();
        } else {
          toast.info('ℹ️ Todos los lotes ya tienen nombres correctos');
        }
      } else {
        toast.error('Error al actualizar nombres de lotes');
      }
    } catch (error) {
      toast.error('Error al actualizar nombres de lotes');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleDebug}
        disabled={isDebugging}
        variant="outline"
        size="sm"
        className="flex items-center space-x-2"
      >
        {isDebugging ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Bug className="w-4 h-4" />}
        <span>Debug Datos</span>
      </Button>
      
      <Button
        onClick={handleUpdateExisting}
        disabled={isUpdating}
        variant="outline"
        size="sm"
        className="flex items-center space-x-2"
      >
        {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
        <span>Corregir Nombres</span>
      </Button>
    </div>
  );
};

export default DebugLotsButton;
