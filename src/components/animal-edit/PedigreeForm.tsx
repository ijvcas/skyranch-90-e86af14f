
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
  console.log('PedigreeForm - Current formData with great-grandparents:', {
    motherId: formData.motherId,
    fatherId: formData.fatherId,
    maternalGrandmotherId: formData.maternalGrandmotherId,
    maternalGrandfatherId: formData.maternalGrandfatherId,
    paternalGrandmotherId: formData.paternalGrandmotherId,
    paternalGrandfatherId: formData.paternalGrandfatherId,
    maternalGreatGrandmotherMaternalId: formData.maternalGreatGrandmotherMaternalId,
    maternalGreatGrandfatherMaternalId: formData.maternalGreatGrandfatherMaternalId,
    maternalGreatGrandmotherPaternalId: formData.maternalGreatGrandmotherPaternalId,
    maternalGreatGrandfatherPaternalId: formData.maternalGreatGrandfatherPaternalId,
    paternalGreatGrandmotherMaternalId: formData.paternalGreatGrandmotherMaternalId,
    paternalGreatGrandfatherMaternalId: formData.paternalGreatGrandfatherMaternalId,
    paternalGreatGrandmotherPaternalId: formData.paternalGreatGrandmotherPaternalId,
    paternalGreatGrandfatherPaternalId: formData.paternalGreatGrandfatherPaternalId
  });

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl text-gray-900">Información de Pedigrí (3 Generaciones)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Great-Grandparents (3rd Generation) */}
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

        {/* Grandparents (2nd Generation) */}
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

        {/* Parents (1st Generation) */}
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
      </CardContent>
    </Card>
  );
};

export default PedigreeForm;
