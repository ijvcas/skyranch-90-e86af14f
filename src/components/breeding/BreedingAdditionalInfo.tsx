
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface BreedingAdditionalInfoProps {
  formData: {
    veterinarian: string;
    cost: string;
    breedingNotes: string;
  };
  onInputChange: (field: string, value: any) => void;
}

const BreedingAdditionalInfo: React.FC<BreedingAdditionalInfoProps> = ({
  formData,
  onInputChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Información Adicional</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="veterinarian">Veterinario</Label>
            <Input
              id="veterinarian"
              value={formData.veterinarian}
              onChange={(e) => onInputChange('veterinarian', e.target.value)}
              placeholder="Nombre del veterinario"
            />
          </div>
          <div>
            <Label htmlFor="cost">Costo ($)</Label>
            <Input
              id="cost"
              type="number"
              step="0.01"
              min="0"
              value={formData.cost}
              onChange={(e) => onInputChange('cost', e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="breedingNotes">Notas</Label>
          <Textarea
            id="breedingNotes"
            value={formData.breedingNotes}
            onChange={(e) => onInputChange('breedingNotes', e.target.value)}
            placeholder="Notas adicionales sobre el apareamiento..."
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default BreedingAdditionalInfo;
