
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface CompleteDeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  userName: string;
  isDeleting: boolean;
}

const CompleteDeleteDialog: React.FC<CompleteDeleteDialogProps> = ({
  isOpen,
  onOpenChange,
  onConfirm,
  userName,
  isDeleting
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar Completamente a {userName}?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              <strong>⚠️ ELIMINACIÓN COMPLETA:</strong> Esta acción eliminará al usuario de:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>La tabla de usuarios de la aplicación</li>
              <li>El sistema de autenticación de Supabase</li>
              <li>Todos los datos asociados</li>
            </ul>
            <p className="text-sm text-gray-600">
              <strong>Nota:</strong> Esta es la opción recomendada para usuarios de prueba que no deben reaparecer en el sistema.
            </p>
            <p className="text-red-600 font-medium">
              Esta acción no se puede deshacer.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar Completamente'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CompleteDeleteDialog;
