
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

  // Improved gender filtering - check for multiple possible gender values
  const femaleAnimals = animals.filter(animal => {
    const gender = animal.gender?.toLowerCase().trim();
    return gender === 'female' || gender === 'hembra' || gender === 'f';
  });

  const maleAnimals = animals.filter(animal => {
    const gender = animal.gender?.toLowerCase().trim();
    return gender === 'male' || gender === 'macho' || gender === 'm';
  });

  // Debug logging to understand what gender values we have
  console.log('🐄 BreedingBasicInfo - Gender Analysis:', {
    totalAnimals: animals.length,
    femaleAnimals: femaleAnimals.length,
    maleAnimals: maleAnimals.length,
    allGenderValues: animals.map(a => ({ id: a.id, name: a.name, gender: a.gender })),
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
              <SelectTrigger className="w-full bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-500">
                <SelectValue placeholder="Seleccionar madre" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto z-[60] bg-white border border-gray-200 shadow-lg">
                {femaleAnimals.length === 0 ? (
                  <div className="p-3 text-gray-500 text-sm">
                    {animals.length === 0 ? 'No hay animales registrados' : 'No hay hembras disponibles'}
                    <div className="text-xs mt-1 text-gray-400">
                      Total animales: {animals.length}
                    </div>
                  </div>
                ) : (
                  femaleAnimals.map((animal) => (
                    <SelectItem 
                      key={animal.id} 
                      value={animal.id} 
                      className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100 px-3 py-2"
                    >
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
              <SelectTrigger className="w-full bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-500">
                <SelectValue placeholder="Seleccionar padre" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto z-[60] bg-white border border-gray-200 shadow-lg">
                {maleAnimals.length === 0 ? (
                  <div className="p-3 text-gray-500 text-sm">
                    {animals.length === 0 ? 'No hay animales registrados' : 'No hay machos disponibles'}
                    <div className="text-xs mt-1 text-gray-400">
                      Total animales: {animals.length}
                    </div>
                  </div>
                ) : (
                  maleAnimals.map((animal) => (
                    <SelectItem 
                      key={animal.id} 
                      value={animal.id} 
                      className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100 px-3 py-2"
                    >
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
              <SelectTrigger className="w-full bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[60] bg-white border border-gray-200 shadow-lg">
                <SelectItem value="natural" className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100">Natural</SelectItem>
                <SelectItem value="artificial_insemination" className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100">Inseminación Artificial</SelectItem>
                <SelectItem value="embryo_transfer" className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100">Transferencia de Embriones</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <Select value={formData.status} onValueChange={(value) => onInputChange('status', value)}>
              <SelectTrigger className="w-full bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[60] bg-white border border-gray-200 shadow-lg">
                <SelectItem value="planned" className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100">Planificado</SelectItem>
                <SelectItem value="confirmed_pregnant" className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100">Embarazo Confirmado</SelectItem>
                <SelectItem value="not_pregnant" className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100">No Embarazada</SelectItem>
                <SelectItem value="birth_completed" className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100">Parto Completado</SelectItem>
                <SelectItem value="failed" className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100">Fallido</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BreedingBasicInfo;
