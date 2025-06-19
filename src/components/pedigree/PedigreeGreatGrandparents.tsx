
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PedigreeGreatGrandparentsProps {
  formData: any;
  onInputChange: (field: string, value: string) => void;
  disabled?: boolean;
}

const PedigreeGreatGrandparents = ({ formData, onInputChange, disabled = false }: PedigreeGreatGrandparentsProps) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Bisabuelos (3ra Generación)</h3>
      <div className="space-y-6">
        {/* Maternal Great-Grandparents */}
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-3">Línea Materna de la Madre</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maternalGreatGrandmotherMaternalId">Bisabuela Materna (Madre)</Label>
              <Input
                id="maternalGreatGrandmotherMaternalId"
                name={`maternal-great-grandmother-maternal-${Math.random()}`}
                type="text"
                value={formData.maternalGreatGrandmotherMaternalId || ''}
                onChange={(e) => onInputChange('maternalGreatGrandmotherMaternalId', e.target.value)}
                placeholder="Nombre de la bisabuela materna"
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
              <Label htmlFor="maternalGreatGrandfatherMaternalId">Bisabuelo Materno (Madre)</Label>
              <Input
                id="maternalGreatGrandfatherMaternalId"
                name={`maternal-great-grandfather-maternal-${Math.random()}`}
                type="text"
                value={formData.maternalGreatGrandfatherMaternalId || ''}
                onChange={(e) => onInputChange('maternalGreatGrandfatherMaternalId', e.target.value)}
                placeholder="Nombre del bisabuelo materno"
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
          <h4 className="text-md font-medium text-gray-700 mb-3">Línea Paterna de la Madre</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maternalGreatGrandmotherPaternalId">Bisabuela Paterna (Madre)</Label>
              <Input
                id="maternalGreatGrandmotherPaternalId"
                name={`maternal-great-grandmother-paternal-${Math.random()}`}
                type="text"
                value={formData.maternalGreatGrandmotherPaternalId || ''}
                onChange={(e) => onInputChange('maternalGreatGrandmotherPaternalId', e.target.value)}
                placeholder="Nombre de la bisabuela paterna"
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
              <Label htmlFor="maternalGreatGrandfatherPaternalId">Bisabuelo Paterno (Madre)</Label>
              <Input
                id="maternalGreatGrandfatherPaternalId"
                name={`maternal-great-grandfather-paternal-${Math.random()}`}
                type="text"
                value={formData.maternalGreatGrandfatherPaternalId || ''}
                onChange={(e) => onInputChange('maternalGreatGrandfatherPaternalId', e.target.value)}
                placeholder="Nombre del bisabuelo paterno"
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

        {/* Paternal Great-Grandparents */}
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-3">Línea Materna del Padre</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="paternalGreatGrandmotherMaternalId">Bisabuela Materna (Padre)</Label>
              <Input
                id="paternalGreatGrandmotherMaternalId"
                name={`paternal-great-grandmother-maternal-${Math.random()}`}
                type="text"
                value={formData.paternalGreatGrandmotherMaternalId || ''}
                onChange={(e) => onInputChange('paternalGreatGrandmotherMaternalId', e.target.value)}
                placeholder="Nombre de la bisabuela materna"
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
              <Label htmlFor="paternalGreatGrandfatherMaternalId">Bisabuelo Materno (Padre)</Label>
              <Input
                id="paternalGreatGrandfatherMaternalId"
                name={`paternal-great-grandfather-maternal-${Math.random()}`}
                type="text"
                value={formData.paternalGreatGrandfatherMaternalId || ''}
                onChange={(e) => onInputChange('paternalGreatGrandfatherMaternalId', e.target.value)}
                placeholder="Nombre del bisabuelo materno"
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
          <h4 className="text-md font-medium text-gray-700 mb-3">Línea Paterna del Padre</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="paternalGreatGrandmotherPaternalId">Bisabuela Paterna (Padre)</Label>
              <Input
                id="paternalGreatGrandmotherPaternalId"
                name={`paternal-great-grandmother-paternal-${Math.random()}`}
                type="text"
                value={formData.paternalGreatGrandmotherPaternalId || ''}
                onChange={(e) => onInputChange('paternalGreatGrandmotherPaternalId', e.target.value)}
                placeholder="Nombre de la bisabuela paterna"
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
              <Label htmlFor="paternalGreatGrandfatherPaternalId">Bisabuelo Paterno (Padre)</Label>
              <Input
                id="paternalGreatGrandfatherPaternalId"
                name={`paternal-great-grandfather-paternal-${Math.random()}`}
                type="text"
                value={formData.paternalGreatGrandfatherPaternalId || ''}
                onChange={(e) => onInputChange('paternalGreatGrandfatherPaternalId', e.target.value)}
                placeholder="Nombre del bisabuelo paterno"
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

export default PedigreeGreatGrandparents;
