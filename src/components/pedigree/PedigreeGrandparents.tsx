
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PedigreeGrandparentsProps {
  formData: any;
  onInputChange: (field: string, value: string) => void;
  disabled?: boolean;
}

const PedigreeGrandparents = ({ formData, onInputChange, disabled = false }: PedigreeGrandparentsProps) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Abuelos (2da Generación)</h3>
      <div className="space-y-4">
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-2">Línea Materna</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maternalGrandmotherId">Abuela Materna</Label>
              <Input
                id="maternalGrandmotherId"
                name={`maternal-grandmother-${Math.random()}`}
                type="text"
                value={formData.maternalGrandmotherId || ''}
                onChange={(e) => onInputChange('maternalGrandmotherId', e.target.value)}
                placeholder="Nombre de la abuela materna"
                className="mt-1"
                disabled={disabled}
                autoComplete="off"
                data-lpignore="true"
                data-1p-ignore="true"
                data-bitwarden-ignore="true"
                data-form-type="other"
                spellCheck="false"
              />
              <p className="text-xs text-gray-500 mt-1">Opcional - cualquier nombre</p>
            </div>
            <div>
              <Label htmlFor="maternalGrandfatherId">Abuelo Materno</Label>
              <Input
                id="maternalGrandfatherId"
                name={`maternal-grandfather-${Math.random()}`}
                type="text"
                value={formData.maternalGrandfatherId || ''}
                onChange={(e) => onInputChange('maternalGrandfatherId', e.target.value)}
                placeholder="Nombre del abuelo materno"
                className="mt-1"
                disabled={disabled}
                autoComplete="off"
                data-lpignore="true"
                data-1p-ignore="true"
                data-bitwarden-ignore="true"
                data-form-type="other"
                spellCheck="false"
              />
              <p className="text-xs text-gray-500 mt-1">Opcional - cualquier nombre</p>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-2">Línea Paterna</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="paternalGrandmotherId">Abuela Paterna</Label>
              <Input
                id="paternalGrandmotherId"
                name={`paternal-grandmother-${Math.random()}`}
                type="text"
                value={formData.paternalGrandmotherId || ''}
                onChange={(e) => onInputChange('paternalGrandmotherId', e.target.value)}
                placeholder="Nombre de la abuela paterna"
                className="mt-1"
                disabled={disabled}
                autoComplete="off"
                data-lpignore="true"
                data-1p-ignore="true"
                data-bitwarden-ignore="true"
                data-form-type="other"
                spellCheck="false"
              />
              <p className="text-xs text-gray-500 mt-1">Opcional - cualquier nombre</p>
            </div>
            <div>
              <Label htmlFor="paternalGrandfatherId">Abuelo Paterno</Label>
              <Input
                id="paternalGrandfatherId"
                name={`paternal-grandfather-${Math.random()}`}
                type="text"
                value={formData.paternalGrandfatherId || ''}
                onChange={(e) => onInputChange('paternalGrandfatherId', e.target.value)}
                placeholder="Nombre del abuelo paterno"
                className="mt-1"
                disabled={disabled}
                autoComplete="off"
                data-lpignore="true"
                data-1p-ignore="true"
                data-bitwarden-ignore="true"
                data-form-type="other"
                spellCheck="false"
              />
              <p className="text-xs text-gray-500 mt-1">Opcional - cualquier nombre</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PedigreeGrandparents;
