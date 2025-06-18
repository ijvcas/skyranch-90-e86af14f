
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Animal } from '@/stores/animalStore';
import { useTimezone } from '@/hooks/useTimezone';
import DatePickerField from '@/components/calendar/DatePickerField';

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
  const { parseDateInput } = useTimezone();

  const handleDateChange = (field: string, date: string) => {
    onInputChange(field, date);
  };

  const femaleAnimals = animals.filter(animal => animal.gender === 'female');
  const maleAnimals = animals.filter(animal => animal.gender === 'male');

  console.log('🐄 BreedingBasicInfo - Animals loaded:', {
    totalAnimals: animals.length,
    femaleAnimals: femaleAnimals.length,
    maleAnimals: maleAnimals.length,
    formData: formData
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información del Apareamiento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="motherId">Madre *</Label>
            <Select 
              value={formData.motherId} 
              onValueChange={(value) => {
                console.log('🐄 Mother selected:', value);
                onInputChange('motherId', value);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar madre" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto z-50 bg-white border border-gray-200 shadow-lg">
                {femaleAnimals.length === 0 ? (
                  <div className="p-2 text-gray-500 text-sm">No hay hembras disponibles</div>
                ) : (
                  femaleAnimals.map((animal) => (
                    <SelectItem key={animal.id} value={animal.id} className="cursor-pointer hover:bg-gray-100">
                      {animal.name} (#{animal.id.slice(-4)}) - {animal.species}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fatherId">Padre *</Label>
            <Select 
              value={formData.fatherId} 
              onValueChange={(value) => {
                console.log('🐄 Father selected:', value);
                onInputChange('fatherId', value);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar padre" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto z-50 bg-white border border-gray-200 shadow-lg">
                {maleAnimals.length === 0 ? (
                  <div className="p-2 text-gray-500 text-sm">No hay machos disponibles</div>
                ) : (
                  maleAnimals.map((animal) => (
                    <SelectItem key={animal.id} value={animal.id} className="cursor-pointer hover:bg-gray-100">
                      {animal.name} (#{animal.id.slice(-4)}) - {animal.species}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <DatePickerField
              value={formData.breedingDate}
              onChange={(date) => handleDateChange('breedingDate', date)}
              label="Fecha de Apareamiento"
              placeholder="Seleccionar fecha"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="breedingMethod">Método de Apareamiento</Label>
            <Select value={formData.breedingMethod} onValueChange={(value) => onInputChange('breedingMethod', value)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-50 bg-white border border-gray-200 shadow-lg">
                <SelectItem value="natural">Natural</SelectItem>
                <SelectItem value="artificial_insemination">Inseminación Artificial</SelectItem>
                <SelectItem value="embryo_transfer">Transferencia de Embriones</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <Select value={formData.status} onValueChange={(value) => onInputChange('status', value)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-50 bg-white border border-gray-200 shadow-lg">
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
