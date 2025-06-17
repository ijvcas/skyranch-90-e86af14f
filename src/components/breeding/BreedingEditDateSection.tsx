
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { Animal } from '@/stores/animalStore';
import { useTimezone } from '@/hooks/useTimezone';

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
  const { formatDateInput, parseDateInput } = useTimezone();

  const handleDateChange = (field: string, displayValue: string) => {
    const isoDate = parseDateInput(displayValue);
    onInputChange(field, isoDate);
  };

  const placeholder = formatDateInput('').includes('/') ? 'dd/mm/yyyy' : 'mm/dd/yyyy';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <Label htmlFor="expectedDueDate">Fecha Esperada de Parto</Label>
        <div className="space-y-2">
          <Input
            id="expectedDueDate"
            type="text"
            placeholder={placeholder}
            value={formatDateInput(formData.expectedDueDate)}
            onChange={(e) => handleDateChange('expectedDueDate', e.target.value)}
            maxLength={10}
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
        <Input
          id="actualBirthDate"
          type="text"
          placeholder={placeholder}
          value={formatDateInput(formData.actualBirthDate)}
          onChange={(e) => handleDateChange('actualBirthDate', e.target.value)}
          maxLength={10}
        />
      </div>
    </div>
  );
};

export default BreedingEditDateSection;
