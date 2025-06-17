
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
    status: 'planned' | 'failed' | 'birth_completed' | 'completed' | 'confirmed_pregnant' | 'not_pregnant';
  };
  animals: Animal[];
  onInputChange: (field: string, value: any) => void;
}

const BreedingBasicInfo: React.FC<BreedingBasicInfoProps> = ({
  formData,
  animals,
  onInputChange
}) => {
  // Format date for display (dd/mm/yyyy)
  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Parse date from display format (dd/mm/yyyy) to ISO format
  const parseDateFromDisplay = (displayValue: string) => {
    if (!displayValue || displayValue.length !== 10) return '';
    
    const parts = displayValue.split('/');
    if (parts.length !== 3) return '';
    
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const year = parseInt(parts[2]);
    
    if (isNaN(day) || isNaN(month) || isNaN(year)) return '';
    if (day < 1 || day > 31 || month < 1 || month > 12) return '';
    
    const date = new Date(year, month - 1, day);
    return date.toISOString().split('T')[0];
  };

  const handleDateChange = (field: string, displayValue: string) => {
    const isoDate = parseDateFromDisplay(displayValue);
    onInputChange(field, isoDate);
  };

  const femaleAnimals = animals.filter(animal => animal.sex === 'female');
  const maleAnimals = animals.filter(animal => animal.sex === 'male');

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
                {femaleAnimals.map((animal) => (
                  <SelectItem key={animal.id} value={animal.id}>
                    {animal.name} (#{animal.tagNumber || animal.id.slice(-4)}) - {animal.species}
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
                {maleAnimals.map((animal) => (
                  <SelectItem key={animal.id} value={animal.id}>
                    {animal.name} (#{animal.tagNumber || animal.id.slice(-4)}) - {animal.species}
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
              type="text"
              placeholder="dd/mm/yyyy"
              value={formatDateForDisplay(formData.breedingDate)}
              onChange={(e) => handleDateChange('breedingDate', e.target.value)}
              maxLength={10}
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
                <SelectItem value="planned">Planificado</SelectItem>
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
