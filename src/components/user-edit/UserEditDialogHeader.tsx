
import React from 'react';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Pencil } from 'lucide-react';

const UserEditDialogHeader: React.FC = () => {
  return (
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <Pencil className="w-5 h-5" />
        Editar Usuario
      </DialogTitle>
      <DialogDescription>
        Modifica la información del usuario. Los campos marcados con * son obligatorios.
      </DialogDescription>
    </DialogHeader>
  );
};

export default UserEditDialogHeader;
