
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { Animal } from '@/stores/animalStore';

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <Label htmlFor="expectedDueDate">Fecha Esperada de Parto</Label>
        <div className="space-y-2">
          <Input
            id="expectedDueDate"
            type="text"
            placeholder="dd/mm/yyyy"
            value={formatDateForDisplay(formData.expectedDueDate)}
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
          placeholder="dd/mm/yyyy"
          value={formatDateForDisplay(formData.actualBirthDate)}
          onChange={(e) => handleDateChange('actualBirthDate', e.target.value)}
          maxLength={10}
        />
      </div>
    </div>
  );
};

export default BreedingEditDateSection;
