
import React from 'react';
import { Button } from '@/components/ui/button';

interface FormActionsProps {
  onCancel: () => void;
  onSubmit?: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  submitText?: string;
}

const FormActions: React.FC<FormActionsProps> = ({
  onCancel,
  onSubmit,
  isSubmitting,
  submitText = 'Guardar Registro'
}) => {
  return (
    <div className="flex justify-end space-x-2">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancelar
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Guardando...' : submitText}
      </Button>
    </div>
  );
};

export default FormActions;
