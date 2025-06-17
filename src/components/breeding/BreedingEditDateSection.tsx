
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { Animal } from '@/stores/animalStore';
import DatePickerField from '@/components/calendar/DatePickerField';

interface BreedingEditDateSectionProps {
  formData: {
    motherId: string;
    breedingDate: string;
    expectedDueDate: string;
    actualBirthDate: string;
  };
  animals: Animal[];
  onInputChange: (field: string, value: any) => void;
  onRecalculateDate: () => void;
}

const BreedingEditDateSection: React.FC<BreedingEditDateSectionProps> = ({
  formData,
  animals,
  onInputChange,
  onRecalculateDate
}) => {
  const handleDateChange = (field: string, date: string) => {
    onInputChange(field, date);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <Label htmlFor="expectedDueDate">Fecha Esperada de Parto</Label>
        <div className="space-y-2">
          <DatePickerField
            value={formData.expectedDueDate}
            onChange={(date) => handleDateChange('expectedDueDate', date)}
            label=""
            placeholder="Seleccionar fecha"
          />
          {formData.motherId && formData.breedingDate && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRecalculateDate}
              className="w-full text-xs"
            >
              <Calendar className="w-3 h-3 mr-1" />
              Recalcular según especie
            </Button>
          )}
        </div>
      </div>
      <div>
        <DatePickerField
          value={formData.actualBirthDate}
          onChange={(date) => handleDateChange('actualBirthDate', date)}
          label="Fecha Real de Parto"
          placeholder="Seleccionar fecha"
        />
      </div>
    </div>
  );
};

export default BreedingEditDateSection;
