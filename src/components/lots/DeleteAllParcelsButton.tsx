
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
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
import { supabase } from '@/integrations/supabase/client';

interface DeleteAllParcelsButtonProps {
  onDeleted: () => void;
}

const DeleteAllParcelsButton: React.FC<DeleteAllParcelsButtonProps> = ({ onDeleted }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAll = async () => {
    setIsDeleting(true);
    console.log('🗑️ Starting complete parcel deletion...');
    
    try {
      const { error } = await supabase
        .from('cadastral_parcels')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows
      
      if (error) {
        console.error('❌ Error deleting parcels:', error);
        toast.error('Error al eliminar las parcelas');
      } else {
        console.log('✅ Successfully deleted all cadastral parcels');
        toast.success('Todas las parcelas eliminadas correctamente');
        onDeleted();
      }
    } catch (error) {
      console.error('❌ Unexpected error:', error);
      toast.error('Error inesperado al eliminar las parcelas');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="destructive" 
          size="sm"
          className="w-full justify-start gap-2"
          disabled={isDeleting}
        >
          <Trash2 className="w-4 h-4" />
          <span>Eliminar Todas las Parcelas</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Confirmar Eliminación Total
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción eliminará TODAS las parcelas catastrales de la base de datos. 
            Esta acción no se puede deshacer. ¿Estás seguro de que deseas continuar?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDeleteAll}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? 'Eliminando...' : 'Sí, Eliminar Todo'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteAllParcelsButton;
