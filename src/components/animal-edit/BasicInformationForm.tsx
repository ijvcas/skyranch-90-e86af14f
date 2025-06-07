
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BasicInformationFormProps {
  formData: any;
  onInputChange: (field: string, value: string) => void;
  disabled?: boolean;
}

const BasicInformationForm = ({ formData, onInputChange, disabled = false }: BasicInformationFormProps) => {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl text-gray-900">Información Básica</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              name={`animal-name-${Math.random()}`}
              type="text"
              value={formData.name || ''}
              onChange={(e) => onInputChange('name', e.target.value)}
              placeholder="Ej: Bella"
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
            <Label htmlFor="tag">Número de Etiqueta *</Label>
            <Input
              id="tag"
              name={`animal-tag-${Math.random()}`}
              type="text"
              value={formData.tag || ''}
              onChange={(e) => onInputChange('tag', e.target.value)}
              placeholder="Ej: 001"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="species">Especie *</Label>
            <Select value={formData.species || ''} onValueChange={(value) => onInputChange('species', value)} disabled={disabled}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Seleccionar especie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bovino">Bovino</SelectItem>
                <SelectItem value="ovino">Ovino</SelectItem>
                <SelectItem value="caprino">Caprino</SelectItem>
                <SelectItem value="porcino">Porcino</SelectItem>
                <SelectItem value="equino">Equino</SelectItem>
                <SelectItem value="aviar">Aviar</SelectItem>
                <SelectItem value="caninos">Caninos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="breed">Raza</Label>
            <Input
              id="breed"
              name={`animal-breed-${Math.random()}`}
              type="text"
              value={formData.breed || ''}
              onChange={(e) => onInputChange('breed', e.target.value)}
              placeholder="Ej: Holstein"
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
            <Input
              id="birthDate"
              name={`animal-birthdate-${Math.random()}`}
              type="date"
              value={formData.birthDate || ''}
              onChange={(e) => onInputChange('birthDate', e.target.value)}
              className="mt-1"
              disabled={disabled}
              autoComplete="off"
              data-lpignore="true"
              data-1p-ignore="true"
              data-bitwarden-ignore="true"
              data-form-type="other"
            />
          </div>
          <div>
            <Label htmlFor="gender">Sexo</Label>
            <Select value={formData.gender || ''} onValueChange={(value) => onInputChange('gender', value)} disabled={disabled}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Seleccionar sexo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="macho">Macho</SelectItem>
                <SelectItem value="hembra">Hembra</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="weight">Peso (kg)</Label>
            <Input
              id="weight"
              name={`animal-weight-${Math.random()}`}
              type="number"
              value={formData.weight || ''}
              onChange={(e) => onInputChange('weight', e.target.value)}
              placeholder="Ej: 450"
              className="mt-1"
              disabled={disabled}
              autoComplete="off"
              data-lpignore="true"
              data-1p-ignore="true"
              data-bitwarden-ignore="true"
              data-form-type="other"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="color">Color/Marcas</Label>
          <Input
            id="color"
            name={`animal-color-${Math.random()}`}
            type="text"
            value={formData.color || ''}
            onChange={(e) => onInputChange('color', e.target.value)}
            placeholder="Ej: Negro con manchas blancas"
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
      </CardContent>
    </Card>
  );
};

export default BasicInformationForm;
