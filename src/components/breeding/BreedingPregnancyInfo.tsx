
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Info } from 'lucide-react';
import { getSpeciesDisplayName, getGestationPeriod, calculateActualGestationDuration } from '@/services/gestationService';
import DatePickerField from '@/components/calendar/DatePickerField';

interface BreedingPregnancyInfoProps {
  formData: {
    pregnancyConfirmed: boolean;
    pregnancyConfirmationDate: string;
    pregnancyMethod: 'visual' | 'ultrasound' | 'blood_test' | 'palpation' | '';
    actualBirthDate: string;
    offspringCount: number;
    breedingDate: string;
  };
  motherSpecies: string;
  onInputChange: (field: string, value: any) => void;
}

const BreedingPregnancyInfo: React.FC<BreedingPregnancyInfoProps> = ({
  formData,
  motherSpecies,
  onInputChange
}) => {
  const handleDateChange = (field: string, date: string) => {
    onInputChange(field, date);
  };

  const gestationDuration = formData.breedingDate && formData.actualBirthDate 
    ? calculateActualGestationDuration(formData.breedingDate, formData.actualBirthDate)
    : null;

  const expectedGestationPeriod = motherSpecies ? getGestationPeriod(motherSpecies) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información del Embarazo y Parto</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            checked={formData.pregnancyConfirmed}
            onCheckedChange={(checked) => onInputChange('pregnancyConfirmed', checked)}
          />
          <Label>Embarazo Confirmado</Label>
        </div>

        {formData.pregnancyConfirmed && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <DatePickerField
                value={formData.pregnancyConfirmationDate}
                onChange={(date) => handleDateChange('pregnancyConfirmationDate', date)}
                label="Fecha de Confirmación"
                placeholder="Seleccionar fecha"
              />
            </div>
            <div>
              <Label htmlFor="pregnancyMethod">Método de Confirmación</Label>
              <Select value={formData.pregnancyMethod} onValueChange={(value) => onInputChange('pregnancyMethod', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visual">Visual</SelectItem>
                  <SelectItem value="ultrasound">Ultrasonido</SelectItem>
                  <SelectItem value="blood_test">Análisis de Sangre</SelectItem>
                  <SelectItem value="palpation">Palpación</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <DatePickerField
              value={formData.actualBirthDate}
              onChange={(date) => handleDateChange('actualBirthDate', date)}
              label="Fecha de Nacimiento"
              placeholder="Seleccionar fecha"
            />
          </div>
          <div>
            <Label htmlFor="gestationDuration">Duración de Gestación (días)</Label>
            <div className="space-y-1">
              <Input
                id="gestationDuration"
                type="number"
                value={gestationDuration || ''}
                readOnly
                className="bg-gray-50"
                placeholder={expectedGestationPeriod ? `Esperado: ${expectedGestationPeriod}` : 'Auto-calculado'}
              />
              {expectedGestationPeriod && !gestationDuration && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Info className="w-3 h-3" />
                  <span>Esperado para {getSpeciesDisplayName(motherSpecies)}</span>
                </div>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="offspringCount">Número de Crías</Label>
            <Input
              id="offspringCount"
              type="number"
              min="0"
              value={formData.offspringCount}
              onChange={(e) => onInputChange('offspringCount', parseInt(e.target.value) || 0)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BreedingPregnancyInfo;
