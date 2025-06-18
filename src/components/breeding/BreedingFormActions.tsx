
import React from 'react';
import { Button } from '@/components/ui/button';

interface BreedingFormActionsProps {
  isSubmitting: boolean;
  onSubmit: () => void;
}

const BreedingFormActions: React.FC<BreedingFormActionsProps> = ({
  isSubmitting,
  onSubmit
}) => {
  return (
    <div className="flex space-x-4">
      <Button
        type="submit"
        className="flex-1"
        disabled={isSubmitting}
        onClick={onSubmit}
      >
        {isSubmitting ? 'Guardando...' : 'Crear Registro'}
      </Button>
    </div>
  );
};

export default BreedingFormActions;
