
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

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
        onClick={(e) => {
          e.preventDefault();
          if (!isSubmitting) {
            onSubmit();
          }
        }}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Guardando...
          </>
        ) : (
          'Crear Registro'
        )}
      </Button>
    </div>
  );
};

export default BreedingFormActions;
