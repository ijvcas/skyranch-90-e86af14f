
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Animal } from '@/stores/animalStore';

interface BreedingBasicInfoProps {
  formData: {
    motherId: string;
    fatherId: string;
    breedingDate: string;
    breedingMethod: 'natural' | 'artificial_insemination' | 'embryo_transfer';
    status: 'planned' | 'completed' | 'confirmed_pregnant' | 'not_pregnant' | 'birth_completed' | 'failed';
  };
  animals: Animal[];
  onInputChange: (field: string, value: any) => void;
}

const BreedingBasicInfo: React.FC<BreedingBasicInfoProps> = ({
  formData,
  animals,
  onInputChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Información del Apareamiento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="motherId">Madre *</Label>
            <Select value={formData.motherId} onValueChange={(value) => onInputChange('motherId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar madre" />
              </SelectTrigger>
              <SelectContent>
                {animals.filter(animal => animal.gender === 'hembra').map(animal => (
                  <SelectItem key={animal.id} value={animal.id}>
                    {animal.name} (#{animal.tag}) - {animal.species}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="fatherId">Padre *</Label>
            <Select value={formData.fatherId} onValueChange={(value) => onInputChange('fatherId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar padre" />
              </SelectTrigger>
              <SelectContent>
                {animals.filter(animal => animal.gender === 'macho').map(animal => (
                  <SelectItem key={animal.id} value={animal.id}>
                    {animal.name} (#{animal.tag}) - {animal.species}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="breedingDate">Fecha de Apareamiento *</Label>
            <Input
              id="breedingDate"
              type="date"
              value={formData.breedingDate}
              onChange={(e) => onInputChange('breedingDate', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="breedingMethod">Método de Apareamiento</Label>
            <Select value={formData.breedingMethod} onValueChange={(value) => onInputChange('breedingMethod', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="natural">Natural</SelectItem>
                <SelectItem value="artificial_insemination">Inseminación Artificial</SelectItem>
                <SelectItem value="embryo_transfer">Transferencia de Embriones</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="status">Estado</Label>
            <Select value={formData.status} onValueChange={(value) => onInputChange('status', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planned">Planeado</SelectItem>
                <SelectItem value="completed">Completado</SelectItem>
                <SelectItem value="confirmed_pregnant">Embarazo Confirmado</SelectItem>
                <SelectItem value="not_pregnant">No Embarazada</SelectItem>
                <SelectItem value="birth_completed">Parto Completado</SelectItem>
                <SelectItem value="failed">Fallido</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BreedingBasicInfo;
