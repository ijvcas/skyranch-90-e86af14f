
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PedigreeFormProps {
  formData: any;
  onInputChange: (field: string, value: string) => void;
  disabled?: boolean;
}

const PedigreeForm = ({ formData, onInputChange, disabled = false }: PedigreeFormProps) => {
  console.log('PedigreeForm - Current formData:', {
    motherId: formData.motherId,
    fatherId: formData.fatherId,
    maternalGrandmotherId: formData.maternalGrandmotherId,
    maternalGrandfatherId: formData.maternalGrandfatherId,
    paternalGrandmotherId: formData.paternalGrandmotherId,
    paternalGrandfatherId: formData.paternalGrandfatherId
  });

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl text-gray-900">Información de Pedigrí</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Parents */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Padres</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="motherId">Madre</Label>
              <Input
                id="motherId"
                name={`mother-name-${Math.random()}`}
                type="text"
                value={formData.motherId || ''}
                onChange={(e) => onInputChange('motherId', e.target.value)}
                placeholder="Nombre o etiqueta de la madre"
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
                Escribe el nombre o número de etiqueta de la madre
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
                placeholder="Nombre o etiqueta del padre"
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
                Escribe el nombre o número de etiqueta del padre
              </p>
            </div>
          </div>
        </div>

        {/* Grandparents */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Abuelos</h3>
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
                    placeholder="Nombre o etiqueta de la abuela materna"
                    className="mt-1"
                    disabled={disabled}
                    autoComplete="off"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-bitwarden-ignore="true"
                    data-form-type="other"
                    spellCheck="false"
                  />
                </div>
                <div>
                  <Label htmlFor="maternalGrandfatherId">Abuelo Materno</Label>
                  <Input
                    id="maternalGrandfatherId"
                    name={`maternal-grandfather-${Math.random()}`}
                    type="text"
                    value={formData.maternalGrandfatherId || ''}
                    onChange={(e) => onInputChange('maternalGrandfatherId', e.target.value)}
                    placeholder="Nombre o etiqueta del abuelo materno"
                    className="mt-1"
                    disabled={disabled}
                    autoComplete="off"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-bitwarden-ignore="true"
                    data-form-type="other"
                    spellCheck="false"
                  />
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
                    placeholder="Nombre o etiqueta de la abuela paterna"
                    className="mt-1"
                    disabled={disabled}
                    autoComplete="off"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-bitwarden-ignore="true"
                    data-form-type="other"
                    spellCheck="false"
                  />
                </div>
                <div>
                  <Label htmlFor="paternalGrandfatherId">Abuelo Paterno</Label>
                  <Input
                    id="paternalGrandfatherId"
                    name={`paternal-grandfather-${Math.random()}`}
                    type="text"
                    value={formData.paternalGrandfatherId || ''}
                    onChange={(e) => onInputChange('paternalGrandfatherId', e.target.value)}
                    placeholder="Nombre o etiqueta del abuelo paterno"
                    className="mt-1"
                    disabled={disabled}
                    autoComplete="off"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-bitwarden-ignore="true"
                    data-form-type="other"
                    spellCheck="false"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PedigreeForm;
