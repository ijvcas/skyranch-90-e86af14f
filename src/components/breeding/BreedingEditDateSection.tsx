
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { Animal } from '@/stores/animalStore';
import { DatePickerField } from '@/components/calendar/DatePickerField';

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
  const handleDateChange = (field: string, date: Date | undefined) => {
    if (date) {
      const isoDate = date.toISOString().split('T')[0];
      onInputChange(field, isoDate);
    } else {
      onInputChange(field, '');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <Label htmlFor="expectedDueDate">Fecha Esperada de Parto</Label>
        <div className="space-y-2">
          <DatePickerField
            value={formData.expectedDueDate ? new Date(formData.expectedDueDate + 'T00:00:00') : undefined}
            onChange={(date) => handleDateChange('expectedDueDate', date)}
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
        <Label htmlFor="actualBirthDate">Fecha Real de Parto</Label>
        <DatePickerField
          value={formData.actualBirthDate ? new Date(formData.actualBirthDate + 'T00:00:00') : undefined}
          onChange={(date) => handleDateChange('actualBirthDate', date)}
          placeholder="Seleccionar fecha"
        />
      </div>
    </div>
  );
};

export default BreedingEditDateSection;
