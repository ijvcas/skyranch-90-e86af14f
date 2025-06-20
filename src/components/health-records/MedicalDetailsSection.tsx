
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MedicalDetailsSectionProps {
  formData: {
    veterinarian: string;
    cost: string;
    medication: string;
    dosage: string;
    nextDueDate: string;
    notes: string;
  };
  onInputChange: (field: string, value: string) => void;
}

const MedicalDetailsSection: React.FC<MedicalDetailsSectionProps> = ({
  formData,
  onInputChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalles Médicos</CardTitle>
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
            <Label htmlFor="cost">Costo</Label>
            <Input
              id="cost"
              type="number"
              step="0.01"
              value={formData.cost}
              onChange={(e) => onInputChange('cost', e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="medication">Medicamento</Label>
            <Input
              id="medication"
              value={formData.medication}
              onChange={(e) => onInputChange('medication', e.target.value)}
              placeholder="Nombre del medicamento"
            />
          </div>

          <div>
            <Label htmlFor="dosage">Dosis</Label>
            <Input
              id="dosage"
              value={formData.dosage}
              onChange={(e) => onInputChange('dosage', e.target.value)}
              placeholder="Ej: 5 ML, 2 tabletas, etc."
            />
          </div>
        </div>

        <div>
          <Label htmlFor="nextDueDate">Próximo Vencimiento</Label>
          <Input
            id="nextDueDate"
            type="date"
            value={formData.nextDueDate}
            onChange={(e) => onInputChange('nextDueDate', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="notes">Notas Adicionales</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => onInputChange('notes', e.target.value)}
            placeholder="Notas adicionales sobre el tratamiento..."
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default MedicalDetailsSection;
