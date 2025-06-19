
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PedigreeParentsProps {
  formData: any;
  onInputChange: (field: string, value: string) => void;
  disabled?: boolean;
}

const PedigreeParents = ({ formData, onInputChange, disabled = false }: PedigreeParentsProps) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Padres (1ra Generación)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="motherId">Madre</Label>
          <Input
            id="motherId"
            name={`mother-name-${Math.random()}`}
            type="text"
            value={formData.motherId || ''}
            onChange={(e) => onInputChange('motherId', e.target.value)}
            placeholder="Nombre de la madre"
            className="mt-1"
            disabled={disabled}
            autoComplete="off"
            data-lpignore="true"
            data-1p-ignore="true"
            data-bitwarden-ignore="true"
            data-form-type="other"
            spellCheck="false"
          />
          <p className="text-xs text-gray-500 mt-1">
            Acepta cualquier nombre (registrado o externo)
          </p>
        </div>
        <div>
          <Label htmlFor="fatherId">Padre</Label>
          <Input
            id="fatherId"
            name={`father-name-${Math.random()}`}
            type="text"
            value={formData.fatherId || ''}
            onChange={(e) => onInputChange('fatherId', e.target.value)}
            placeholder="Nombre del padre"
            className="mt-1"
            disabled={disabled}
            autoComplete="off"
            data-lpignore="true"
            data-1p-ignore="true"
            data-bitwarden-ignore="true"
            data-form-type="other"
            spellCheck="false"
          />
          <p className="text-xs text-gray-500 mt-1">
            Acepta cualquier nombre (registrado o externo)
          </p>
        </div>
      </div>
    </div>
  );
};

export default PedigreeParents;
