
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
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <Label htmlFor="expectedDueDate">Fecha Esperada de Parto</Label>
        <div className="space-y-2">
          <Input
            id="expectedDueDate"
            type="date"
            value={formData.expectedDueDate}
            onChange={(e) => onInputChange('expectedDueDate', e.target.value)}
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
          type="date"
          value={formData.actualBirthDate}
          onChange={(e) => onInputChange('actualBirthDate', e.target.value)}
        />
      </div>
    </div>
  );
};

export default BreedingEditDateSection;
