
import React from 'react';
import { DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Save, X } from 'lucide-react';

interface UserEditDialogFooterProps {
  onCancel: () => void;
  onSubmit: () => void;
  isLoading: boolean;
  hasError: boolean;
}

const UserEditDialogFooter: React.FC<UserEditDialogFooterProps> = ({
  onCancel,
  onSubmit,
  isLoading,
  hasError
}) => {
  return (
    <DialogFooter>
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isLoading}
      >
        <X className="w-4 h-4 mr-2" />
        Cancelar
      </Button>
      <Button
        type="submit"
        disabled={isLoading || hasError}
        onClick={onSubmit}
      >
        {isLoading ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Guardando...
          </div>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            Guardar Cambios
          </>
        )}
      </Button>
    </DialogFooter>
  );
};

export default UserEditDialogFooter;
