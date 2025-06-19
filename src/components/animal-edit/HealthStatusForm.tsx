
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface HealthStatusFormProps {
  formData: {
    healthStatus: string;
    notes: string;
  };
  onInputChange: (field: string, value: string) => void;
  disabled?: boolean;
}

const HealthStatusForm = ({ 
  formData, 
  onInputChange, 
  disabled 
}: HealthStatusFormProps) => {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Estado de Salud</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="healthStatus">Estado de Salud</Label>
          <Select 
            value={formData.healthStatus} 
            onValueChange={(value) => onInputChange('healthStatus', value)} 
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el estado de salud" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="healthy">Saludable</SelectItem>
              <SelectItem value="sick">Enfermo</SelectItem>
              <SelectItem value="injured">Herido</SelectItem>
              <SelectItem value="pregnant">Embarazada</SelectItem>
              <SelectItem value="recovering">En Recuperación</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="notes">Notas</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => onInputChange('notes', e.target.value)}
            placeholder="Notas adicionales sobre el animal..."
            disabled={disabled}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthStatusForm;
