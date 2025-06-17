
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Info } from 'lucide-react';
import { getSpeciesDisplayName, getGestationPeriod, calculateActualGestationDuration } from '@/services/gestationService';

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
              <Label htmlFor="pregnancyConfirmationDate">Fecha de Confirmación</Label>
              <Input
                id="pregnancyConfirmationDate"
                type="text"
                placeholder="dd/mm/yyyy"
                value={formatDateForDisplay(formData.pregnancyConfirmationDate)}
                onChange={(e) => handleDateChange('pregnancyConfirmationDate', e.target.value)}
                maxLength={10}
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
            <Label htmlFor="actualBirthDate">Fecha de Nacimiento</Label>
            <Input
              id="actualBirthDate"
              type="text"
              placeholder="dd/mm/yyyy"
              value={formatDateForDisplay(formData.actualBirthDate)}
              onChange={(e) => handleDateChange('actualBirthDate', e.target.value)}
              maxLength={10}
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
