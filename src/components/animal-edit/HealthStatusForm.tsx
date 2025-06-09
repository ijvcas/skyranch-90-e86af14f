
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface HealthStatusFormProps {
  healthStatus: string;
  notes: string;
  onHealthStatusChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  disabled?: boolean;
}

const HealthStatusForm = ({ 
  healthStatus, 
  notes, 
  onHealthStatusChange, 
  onNotesChange, 
  disabled 
}: HealthStatusFormProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="healthStatus">Estado de Salud</Label>
        <Select value={healthStatus} onValueChange={onHealthStatusChange} disabled={disabled}>
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
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Notas adicionales sobre el animal..."
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default HealthStatusForm;
